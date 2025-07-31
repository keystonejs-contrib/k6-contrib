import { KeystoneContext } from '@keystone-6/core/types';

function listNameToPrismaModel(listKey: string) {
  return listKey[0].toLowerCase() + listKey.slice(1);
}

export function isRoot(data: { [key: string]: any }) {
  return !!(data.left === 1);
}

type NodeType = {
  left: string | number;
  right: string | number;
  depth?: string | number;
};

function isAncestorOf(parenNode: NodeType, current: NodeType) {
  return parenNode.left > current.left && parenNode.right < current.right;
}
function isEqualTo(parenNode: NodeType, current: NodeType) {
  return (
    Number(parenNode.left) === Number(current.left) &&
    Number(parenNode.right) === Number(current.right)
  );
}

export async function getRoot(context: KeystoneContext, field: string, listType: string) {
  const roots = await context.prisma[listNameToPrismaModel(listType)].findMany({
    where: {
      [`${field}_depth`]: 0,
      [`${field}_left`]: 1,
    },
    select: {
      id: true,
    },
  });
  if (!roots) {
    return {};
  }
  return roots[0];
}

export async function createRoot() {
  return {
    left: 1,
    right: 2,
    depth: 0,
  };
}

export function isLeaf(data: { [key: string]: number }) {
  return !!(data.right - data.left === 1);
}

export async function getWeight(data: { [key: string]: number }) {
  return data.right - data.left;
}

export async function getParentId(
  data: { [key: string]: number },
  context: KeystoneContext,
  field: string,
  listType: string
) {
  if (isRoot(data)) {
    return null;
  }
  const dbTable = listNameToPrismaModel(listType);
  const parent = await context.prisma[dbTable].findMany({
    where: {
      [`${field}_depth`]: data.depth - 1,
      [`${field}_left`]: {
        lt: data.left,
      },
      [`${field}_right`]: {
        gt: data.right,
      },
    },
    select: {
      id: true,
    },
  });
  if (parent.length) {
    return parent[0].id;
  }
  return '';
}

export async function getParent(
  data: { [key: string]: any },
  context: KeystoneContext,
  field: string,
  listType: string
) {
  if (isRoot(data)) {
    return null;
  }
  const dbTable = listNameToPrismaModel(listType);
  const parent = await context.prisma[dbTable].findMany({
    where: {
      [`${field}_depth`]: data[`${field}_depth`] - 1,
      [`${field}_left`]: {
        lt: data[`${field}_left`],
      },
      [`${field}_right`]: {
        gt: data[`${field}_right`],
      },
    },
    select: {
      id: true,
      [`${field}_depth`]: true,
      [`${field}_left`]: true,
      [`${field}_right`]: true,
    },
  });
  return parent[0];
}

export async function getchildrenCount(
  data: { [key: string]: number },
  context: KeystoneContext,
  field: string,
  listType: string
) {
  if (isLeaf(data)) {
    return 0;
  }
  const children = await context.prisma[listNameToPrismaModel(listType)].findMany({
    where: {
      [`${field}_left`]: {
        gt: data.left,
      },
      [`${field}_right`]: {
        lt: data.right,
      },
      [`${field}_depth`]: {
        gte: data.depth + 1,
      },
    },
    select: {
      id: true,
    },
  });
  return children.length;
}
export async function fetchRoot(
  rootId: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const root = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: rootId },
  });
  if (root[`${fieldKey}_left`] === 1) return root;
  return false;
}

export async function getPrevSibling(
  prevSibling: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const currentNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: prevSibling },
  });
  if (!currentNode) return false;
  return {
    right: currentNode[`${fieldKey}_left`] - 1,
  };
}

export async function getNextSibling(
  nextSibling: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const currentNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: nextSibling },
  });
  if (!currentNode) return false;
  return {
    left: currentNode[`${fieldKey}_right`] + 1,
  };
}

export async function getChildOf(
  childOf: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const currentNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: childOf },
  });
  return {
    depth: currentNode[`${fieldKey}_depth`] - 1,
    left: {
      lt: currentNode[`${fieldKey}_left`],
    },
    right: {
      gt: currentNode[`${fieldKey}_right`],
    },
  };
}

export async function getParentOf(
  parentId: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const currentNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: parentId },
  });
  return {
    depth: currentNode[`${fieldKey}_depth`] + 1,
    left: {
      gt: currentNode[`${fieldKey}_left`],
    },
    right: {
      lt: currentNode[`${fieldKey}_right`],
    },
  };
}

export async function insertLastChildOf(
  parentId: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const bdTable = listNameToPrismaModel(listKey);
  const parentNode = await context.prisma[bdTable].findUnique({
    where: { id: parentId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  if (!parentNode) return false;
  const tree = await fetchTree(parentNode, context, listKey, fieldKey);
  let transactions = [];
  for (const node of tree) {
    if (node[`${fieldKey}_left`] > parentNode[`${fieldKey}_right`]) {
      transactions.push(
        context.prisma[bdTable].update({
          where: {
            id: node.id,
          },
          data: {
            [`${fieldKey}_right`]: node[`${fieldKey}_right`] + 2,
            [`${fieldKey}_left`]: node[`${fieldKey}_left`] + 2,
          },
        })
      );
    }
    if (
      node[`${fieldKey}_right`] >= parentNode[`${fieldKey}_right`] &&
      node[`${fieldKey}_left`] < parentNode[`${fieldKey}_right`]
    ) {
      transactions.push(
        context.prisma[bdTable].update({
          where: {
            id: node.id,
          },
          data: {
            [`${fieldKey}_right`]: node[`${fieldKey}_right`] + 2,
          },
        })
      );
    }
  }
  await context.prisma.$transaction(transactions);
  return {
    left: parentNode[`${fieldKey}_right`],
    right: parentNode[`${fieldKey}_right`] + 1,
    depth: parentNode[`${fieldKey}_depth`] + 1,
  };
}

export async function insertNextSiblingOf(
  nextSiblingId: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const bdTable = listNameToPrismaModel(listKey);
  const destNode = await context.prisma[bdTable].findUnique({
    where: { id: nextSiblingId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  if (!destNode) return false;
  const newLeft = destNode[`${fieldKey}_right`] + 1;
  const newRight = destNode[`${fieldKey}_right`] + 2;
  await shiftLeftRghtValues(newLeft, 2, {
    context,
    field: fieldKey,
    bdTable,
  });
  return {
    left: newLeft,
    right: newRight,
    depth: destNode[`${fieldKey}_depth`],
  };
}

export async function insertPrevSiblingOf(
  nextSiblingId: string,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const bdTable = listNameToPrismaModel(listKey);
  const destNode = await context.prisma[bdTable].findUnique({
    where: { id: nextSiblingId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  if (!destNode) return false;
  const newLeft = destNode[`${fieldKey}_left`];
  const newRight = destNode[`${fieldKey}_left`] + 1;
  await shiftLeftRghtValues(newLeft, 2, {
    context,
    field: fieldKey,
    bdTable,
  });
  return {
    left: newLeft,
    right: newRight,
    depth: destNode[`${fieldKey}_depth`],
  };
}

async function fetchTree(
  parentNode: { [key: string]: any },
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const options = {
    where: {
      [`${fieldKey}_left`]: {
        gte: 1,
      },
      [`${fieldKey}_depth`]: {
        lte: parentNode[`${fieldKey}_depth`] || 1,
      },
    },
    orderBy: {
      [`${fieldKey}_left`]: 'asc',
    },
    select: {
      id: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_depth`]: true,
    },
  };
  return await context.prisma[listNameToPrismaModel(listKey)].findMany(options);
}

export async function moveNode(
  inputData: { [key: string]: any },
  context: KeystoneContext,
  listKey: string,
  fieldKey: string,
  current: { [key: string]: any }
) {
  if (!inputData[fieldKey]) return {};
  if (!Object.keys(current).length) return null;
  const { parentId, prevSiblingOf, nextSiblingOf } = inputData[fieldKey];
  if (parentId) {
    if (parentId === current.id) throw new Error(`You can't choose the same entity`);
    return await moveAsChildOf(parentId, current, { context, fieldKey, listKey });
  }
  if (prevSiblingOf) {
    if (prevSiblingOf === current.id) throw new Error(`You can't choose the same entity`);
    return await moveAsPrevSiblingOf(prevSiblingOf, current, { context, fieldKey, listKey });
  }
  if (nextSiblingOf) {
    if (nextSiblingOf === current.id) throw new Error(`You can't choose the same entity`);
    return await moveAsNextSiblingOf(nextSiblingOf, current, { context, fieldKey, listKey });
  }
}

async function moveAsChildOf(
  parentId: string,
  current: { [key: string]: any },
  options: { [key: string]: any }
) {
  if (!parentId) return { depth: null };
  const { context, fieldKey, listKey } = options;
  const parentNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: parentId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  let prepareParentNode = {
    right: parentNode[`${fieldKey}_right`],
    left: parentNode[`${fieldKey}_left`],
    depth: parentNode[`${fieldKey}_depth`],
  };
  let currentNode = {
    right: current[`${fieldKey}_right`],
    left: current[`${fieldKey}_left`],
    depth: current[`${fieldKey}_depth`],
  };
  if (
    parentId === current.id ||
    isAncestorOf(prepareParentNode, currentNode) ||
    isEqualTo(prepareParentNode, currentNode)
  ) {
    throw new Error('Cannot move node as first child of itself or into a descendant');
  }
  if (parentNode && parentNode.id) {
    const newDepth = parentNode[`${fieldKey}_depth`] + 1;
    await updateNode(
      parentNode[`${fieldKey}_right`],
      newDepth - current[`${fieldKey}_depth`],
      { context, fieldKey, listKey },
      current
    );
    return {
      depth: newDepth,
    };
  }
}

async function moveAsPrevSiblingOf(
  prevSiblingOfId: string,
  current: { [key: string]: any },
  options: { [key: string]: any }
) {
  const { context, fieldKey, listKey } = options;
  const prevSiblingNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: prevSiblingOfId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  let parentNode = {
    right: prevSiblingNode[`${fieldKey}_right`],
    left: prevSiblingNode[`${fieldKey}_left`],
    depth: prevSiblingNode[`${fieldKey}_depth`],
  };
  let currentNode = {
    right: current[`${fieldKey}_right`],
    left: current[`${fieldKey}_left`],
    depth: current[`${fieldKey}_depth`],
  };
  if (
    prevSiblingOfId === current.id ||
    isAncestorOf(parentNode, currentNode) ||
    isEqualTo(parentNode, currentNode)
  ) {
    throw new Error('Cannot move node as previous sibling of itself');
  }
  const newDepth = prevSiblingNode[`${fieldKey}_depth`];
  await updateNode(
    prevSiblingNode[`${fieldKey}_left`],
    newDepth - current[`${fieldKey}_depth`],
    { context, fieldKey, listKey },
    current
  );
  return {
    depth: newDepth,
  };
}
async function moveAsNextSiblingOf(
  nextSiblingId: string,
  current: { [key: string]: any },
  options: { [key: string]: any }
) {
  const { context, fieldKey, listKey } = options;
  const prevSiblingNode = await context.prisma[listNameToPrismaModel(listKey)].findUnique({
    where: { id: nextSiblingId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  let parentNode = {
    right: prevSiblingNode[`${fieldKey}_right`],
    left: prevSiblingNode[`${fieldKey}_left`],
    depth: prevSiblingNode[`${fieldKey}_depth`],
  };
  let currentNode = {
    right: current[`${fieldKey}_right`],
    left: current[`${fieldKey}_left`],
    depth: current[`${fieldKey}_depth`],
  };
  if (
    nextSiblingId === current.id ||
    isAncestorOf(parentNode, currentNode) ||
    isEqualTo(parentNode, currentNode)
  ) {
    throw new Error('Cannot move node as next sibling of itself');
  }
  const newDepth = prevSiblingNode[`${fieldKey}_depth`];
  await updateNode(
    prevSiblingNode[`${fieldKey}_right`] + 1,
    newDepth - current[`${fieldKey}_depth`],
    { context, fieldKey, listKey },
    current
  );
  return {
    depth: newDepth,
  };
}
export async function deleteResolver(
  current: { [key: string]: any },
  options: { [key: string]: any }
) {
  if (!current.id) return;
  const { context, listKey, fieldKey } = options;
  const bdTable = listNameToPrismaModel(listKey);
  const left = current[`${fieldKey}_left`];
  const right = current[`${fieldKey}_right`];
  const depth = current[`${fieldKey}_depth`];
  const parentId = await getParentId({ left, right, depth }, context, fieldKey, listKey);

  const childrenTree = await context.prisma[bdTable].findMany({
    where: {
      AND: [
        {
          [`${fieldKey}_left`]: {
            gt: left,
          },
        },
        {
          [`${fieldKey}_left`]: {
            lt: right,
          },
        },
      ],
      [`${fieldKey}_depth`]: depth + 1,
    },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  if (childrenTree && childrenTree.length) {
    for (const child of childrenTree) {
      const move = await moveAsChildOf(parentId, child, options);
      if (move && move.depth !== null && move.depth !== undefined) {
        await context.prisma[bdTable].update({
          where: {
            id: child.id,
          },
          data: {
            [`${fieldKey}_depth`]: move.depth,
          },
        });
      }
    }
  }

  return;
}

async function shiftLeftRghtValues(
  first: number,
  increment: number,
  options: { [key: string]: any }
) {
  const { context, bdTable, field } = options;
  const childrenTree = await context.prisma[bdTable].findMany({
    where: {
      [`${field}_left`]: {
        gte: first,
      },
    },
    select: {
      id: true,
      [`${field}_left`]: true,
      [`${field}_right`]: true,
      [`${field}_depth`]: true,
    },
  });
  let transactions = [];
  if (childrenTree && childrenTree.length) {
    for (const child of childrenTree) {
      transactions.push(
        context.prisma[bdTable].update({
          where: {
            id: child.id,
          },
          data: {
            [`${field}_left`]: child[`${field}_left`] + increment,
          },
        })
      );
    }
  }

  const parentTree = await context.prisma[bdTable].findMany({
    where: {
      [`${field}_right`]: {
        gte: first,
      },
    },
    select: {
      id: true,
      [`${field}_left`]: true,
      [`${field}_right`]: true,
      [`${field}_depth`]: true,
    },
  });
  if (parentTree && parentTree.length) {
    for (const child of parentTree) {
      transactions.push(
        context.prisma[bdTable].update({
          where: {
            id: child.id,
          },
          data: {
            [`${field}_right`]: child[`${field}_right`] + increment,
          },
        })
      );
    }
  }

  return await context.prisma.$transaction(transactions);
}

async function updateNode(
  destLeft: number,
  depthDiff: number,
  options: { [key: string]: any },
  current: { [key: string]: any }
) {
  const { context, fieldKey, listKey } = options;
  const bdTable = listNameToPrismaModel(listKey);
  let left = current[`${fieldKey}_left`];
  let right = current[`${fieldKey}_right`];
  const treeSize = right - left + 1;
  await shiftLeftRghtValues(destLeft, treeSize, {
    context,
    field: fieldKey,
    bdTable,
  });
  if (left >= destLeft) {
    left += treeSize;
    right += treeSize;
  }
  const childrenTree = await context.prisma[bdTable].findMany({
    where: {
      [`${fieldKey}_left`]: {
        gt: left,
      },
      [`${fieldKey}_right`]: {
        lt: right,
      },
    },
    select: {
      id: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  const transactions = [];
  for (const child of childrenTree) {
    transactions.push(
      context.prisma[bdTable].update({
        where: {
          id: child.id,
        },
        data: {
          [`${fieldKey}_depth`]: child[`${fieldKey}_depth`] + depthDiff,
        },
      })
    );
  }
  await context.prisma.$transaction(transactions);
  await shiftLeftRightRange(left, right, destLeft - left, options);
  await shiftLeftRghtValues(right + 1, 0 - treeSize, {
    context,
    field: fieldKey,
    bdTable,
  });
  return;
}

async function shiftLeftRightRange(
  first: number,
  last: number,
  increment: number,
  options: { [key: string]: any }
) {
  const { context, fieldKey, listKey } = options;
  const bdTable = listNameToPrismaModel(listKey);
  const transactions = [];
  const leftTree = await context.prisma[bdTable].findMany({
    where: {
      AND: [
        {
          [`${fieldKey}_left`]: {
            gte: first,
          },
        },
        {
          [`${fieldKey}_left`]: {
            lte: last,
          },
        },
      ],
    },
    select: {
      id: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  for (const node of leftTree) {
    transactions.push(
      context.prisma[bdTable].update({
        where: {
          id: node.id,
        },
        data: {
          [`${fieldKey}_left`]: node[`${fieldKey}_left`] + increment,
        },
      })
    );
  }
  const rightTree = await context.prisma[bdTable].findMany({
    where: {
      AND: [
        {
          [`${fieldKey}_right`]: {
            gte: first,
          },
        },
        {
          [`${fieldKey}_right`]: {
            lte: last,
          },
        },
      ],
    },
    select: {
      id: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  for (const node of rightTree) {
    transactions.push(
      context.prisma[bdTable].update({
        where: {
          id: node.id,
        },
        data: {
          [`${fieldKey}_right`]: node[`${fieldKey}_right`] + increment,
        },
      })
    );
  }

  return await context.prisma.$transaction(transactions);
}

type NestedSetFieldInputType = {
  parentId?: string;
  prevSiblingOf?: string;
  nextSiblingOf?: string;
};

export async function updateEntityIsNullFields(
  data: NestedSetFieldInputType,
  context: KeystoneContext,
  listKey: string,
  fieldKey: string
) {
  const bdTable = listNameToPrismaModel(listKey);
  const root = await getRoot(context, fieldKey, listKey);
  if (!data && root && root.id) {
    const { left, right, depth } = await insertLastChildOf(root.id, context, listKey, fieldKey);
    return {
      left,
      right,
      depth,
    };
  }
  if (!data && !root) {
    throw new Error('Please< create root before update this entity');
  }
  let entityId = '';
  let entityType = '';
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      entityId = value;
      entityType = key;
    }
  }
  const entity = await context.prisma[bdTable].findUnique({
    where: { id: entityId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  const isEntityWithField = !!(entity[`${fieldKey}_right`] && entity[`${fieldKey}_left`]);
  if (!isEntityWithField && root) {
    const { left, right, depth } = await insertLastChildOf(root.id, context, listKey, fieldKey);
    return {
      left,
      right,
      depth,
    };
  }
  switch (entityType) {
    case 'parentId':
      return await insertLastChildOf(entityId, context, listKey, fieldKey);
    case 'prevSiblingOf':
      return await insertPrevSiblingOf(entityId, context, listKey, fieldKey);
    case 'nextSiblingOf':
      return await insertNextSiblingOf(entityId, context, listKey, fieldKey);
    default:
      break;
  }
}
export async function nodeIsInTree(data: NestedSetFieldInputType, options: { [key: string]: any }) {
  const { fieldKey, listKey, context } = options;
  const bdTable = listNameToPrismaModel(listKey);
  let entityId = '';
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      entityId = value;
    }
  }
  const entity = await context.prisma[bdTable].findUnique({
    where: { id: entityId },
    select: {
      id: true,
      [`${fieldKey}_right`]: true,
      [`${fieldKey}_left`]: true,
      [`${fieldKey}_depth`]: true,
    },
  });
  if (!entity[`${fieldKey}_left`]) {
    throw new Error(`Please add this entity ${entityId} in tree`);
  }
  return;
}
