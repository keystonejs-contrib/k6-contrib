/** @jsxRuntime classic */
/** @jsx jsx */

import 'intersection-observer';
import { RefObject, useEffect, useMemo, useState, createContext, useContext, useRef } from 'react';

import { jsx } from '@keystone-ui/core';
import { Select, selectComponents, Radio } from '@keystone-ui/fields';
import { ListMeta } from '@keystone-6/core/types';
import {
  ApolloClient,
  gql,
  InMemoryCache,
  TypedDocumentNode,
  useApolloClient,
  useQuery,
} from '@keystone-6/core/admin-ui/apollo';

const idField = '____id____';

const labelField = '____label____';

const nestedSetField = '____nestedSet____';

const LoadingIndicatorContext = createContext<{
  count: number;
  ref: (element: HTMLElement | null) => void;
}>({
  count: 0,
  ref: () => {},
});

function useFilter(search: string, list: ListMeta) {
  return useMemo(() => {
    let conditions: Record<string, any>[] = [];
    if (search.length) {
      const trimmedSearch = search.trim();
      for (const field of Object.values(list.fields)) {
        if (field.search !== null) {
          conditions.push({
            [field.path]: {
              contains: trimmedSearch,
              mode: field.search === 'insensitive' ? 'insensitive' : undefined,
            },
          });
        }
      }
    }
    return { OR: conditions };
  }, [search, list]);
}

function useIntersectionObserver(cb: IntersectionObserverCallback, ref: RefObject<any>) {
  useEffect(() => {
    let observer = new IntersectionObserver(cb, {});
    let node = ref.current;
    if (node !== null) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  });
}

function useDebouncedValue<T>(value: T, limitMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(() => value);

  useEffect(() => {
    let id = setTimeout(() => {
      setDebouncedValue(() => value);
    }, limitMs);
    return () => {
      clearTimeout(id);
    };
  }, [value, limitMs]);
  return debouncedValue;
}

const initialItemsToLoad = 10;
const subsequentItemsToLoad = 50;

export const NestedSetInput = ({
  autoFocus,
  isDisabled,
  isLoading,
  list,
  state,
  field,
  onChange,
  graphqlSelection,
  path,
}: {
  autoFocus?: boolean;
  controlShouldRenderValue: boolean;
  isDisabled: boolean;
  isLoading?: boolean;
  list: ListMeta;
  onChange: void;
  state: {
    left: number;
    right: number;
    depth: number;
    parentId: string;
  };
  field: string;
  graphqlSelection: string;
  path: string;
}) => {
  const [search, setSearch] = useState('');
  const [variant, setVariant] = useState('parentId');
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null);
  const orderByField = { [path]: 'asc' };
  const QUERY: TypedDocumentNode<
    { items: { [idField]: string; [labelField]: string | null }[]; count: number },
    { where: Record<string, any>; take: number; skip: number; orderBy: Record<string, any> }
  > = gql`
    query NestedSetSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!] ) {
      items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${idField}: id
        ${labelField}: ${list.labelField}
        ${graphqlSelection}
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `;

  const debouncedSearch = useDebouncedValue(search, 200);
  const where = useFilter(debouncedSearch, list);

  const link = useApolloClient().link;
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        link,
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                [list.gqlNames.listQueryName]: {
                  keyArgs: ['where'],
                  merge: (existing: readonly unknown[], incoming: readonly unknown[], { args }) => {
                    const merged = existing ? existing.slice() : [];
                    const { skip } = args!;
                    for (let i = 0; i < incoming.length; ++i) {
                      merged[skip + i] = incoming[i];
                    }
                    return merged;
                  },
                },
              },
            },
          },
        }),
      }),
    [link, list.gqlNames.listQueryName]
  );
  const generateIndent = (label: string, depth = 0) => {
    let text = '';
    if (depth > 0) {
      for (let i = 0; i < depth; i++) {
        text += '- ';
      }
    }
    text += label;
    return text;
  };
  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where, take: initialItemsToLoad, skip: 0, orderBy: orderByField },
    client: apolloClient,
  });
  const count = data?.count || 0;
  const options =
    data?.items?.map(({ [idField]: value, [labelField]: label, ...data }) => ({
      value,
      label: generateIndent(label || value, data[path].depth),
      [path]: data[path],
      data,
    })) || [];

  // if parentId get this entity
  let value: { [key: string]: any } = {};
  if (state?.parentId) {
    value = options.find(option => option.value === state?.parentId);
  }
  const loadingIndicatorContextVal = useMemo(
    () => ({
      count,
      ref: setLoadingIndicatorElement,
    }),
    [count]
  );
  const [lastFetchMore, setLastFetchMore] = useState<{
    where: Record<string, any>;
    list: ListMeta;
    skip: number;
  } | null>(null);

  useIntersectionObserver(
    ([{ isIntersecting }]) => {
      const skip = data?.items.length;
      if (
        !loading &&
        skip &&
        isIntersecting &&
        options.length < count &&
        (lastFetchMore?.where !== where ||
          lastFetchMore?.list !== list ||
          lastFetchMore?.skip !== skip)
      ) {
        const QUERY: TypedDocumentNode<
          { items: { [idField]: string; [labelField]: string | null }[] },
          { where: Record<string, any>; take: number; skip: number; orderBy: Record<string, any> }
        > = gql`
              query NestedSetSelectMore($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]) {
                items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
                  ${labelField}: ${list.labelField}
                  ${idField}: id,
                  ${graphqlSelection}
                }
              }
            `;
        setLastFetchMore({ list, skip, where });
        fetchMore({
          query: QUERY,
          variables: {
            where,
            take: subsequentItemsToLoad,
            skip,
            orderBy: orderByField,
          },
        })
          .then(() => {
            setLastFetchMore(null);
          })
          .catch(() => {
            setLastFetchMore(null);
          });
      }
    },
    { current: loadingIndicatorElement }
  );
  if (error) {
    return <span>Error</span>;
  }
  const radioVariants = [
    {
      label: 'Parent',
      value: 'parenId',
      checked: true,
      disabled: false,
    },
    {
      label: 'Before',
      value: 'prevSiblingOf',
      disabled: false,
    },
    {
      label: 'After',
      value: 'nextSiblingOf',
      disabled: false,
    },
  ];
  const radioClass = {
    display: 'flex',
    marginTop: '1rem',
    flexDirection: 'column',
  };
  const setPosition = e => {
    setVariant(e.target.value);
  };
  const container = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'no-wrap',
  };
  const selectWidth = {
    width: '80%',
  };
  const radioButton = {
    marginBottom: '1rem',
  };
  const showError = (value: { [key: string]: any }) => {
    if (!value || !Object.keys(value).length) {
      return <div css={{ color: 'red' }}>Please choose value.</div>;
    }
    return 
  };

  const prepareData = (value: { [key: string]: any }) => {
    if (value) {
      
      if (variant === '') {
        onChange({ parentId: value.value });
        return;
      }
      switch (variant) {
        case 'parentId':
          onChange({ parentId: value.value });
          return;
        case 'prevSiblingOf':
          onChange({ prevSiblingOf: value.value });
          return;
        case 'nextSiblingOf':
          onChange({ nextSiblingOf: value.value });
          return;
      }
    }
    onChange(null);
    return;
  };
  return (
    <div style={container}>
      <div style={selectWidth}>
        <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
          <Select
            // this is necessary because react-select passes a second argument to onInputChange
            // and useState setters log a warning if a second argument is passed
            onInputChange={val => setSearch(val)}
            placeholder="Select"
            isLoading={loading || isLoading}
            autoFocus={autoFocus}
            components={relationshipSelectComponents}
            value={value}
            options={options}
            onChange={value => {
              prepareData(value);
            }}
            isDisabled={isDisabled}
            portalMenu
            isClearable
          />
        </LoadingIndicatorContext.Provider>
        {showError(value)}
      </div>
      <div style={radioClass}>
        {radioVariants.map((variant, index) => (
          <div style={radioButton} key={variant.value}>
            <Radio
              name="position"
              size="medium"
              key={variant.value}
              defaultChecked={index === 0}
              className="radioClass"
              value={variant.value}
              onChange={value => setPosition(value)}
              disabled={variant.disabled}
            >
              {variant.label}
            </Radio>
          </div>
        ))}
      </div>
    </div>
  );
};

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }) => {
    const { count, ref } = useContext(LoadingIndicatorContext);
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center' }} ref={ref}>
          {props.options.length < count && <span css={{ padding: 8 }}>Loading...</span>}
        </div>
      </selectComponents.MenuList>
    );
  },
};
