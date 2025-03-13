## Nested Set

Add nested set field to You keystone project

## Nested Set Model

https://en.wikipedia.org/wiki/Nested_set_model
In database fields: `left`, `rigth`, `depth`

## Graphql Scheme

#### Output

- `left`: Int
- `right`: Int
- `depth`: Int
- `weight`: Int // Serial number through current branch
- `parentId`: ID// Keystone id of direct parent element
- `isLeaf`: Boolean, true if have no children
- `childrenCount` // counts children

#### Filters

- `parentId`: type ID // Keystone id of direct parent element
- `childOf` // filters all elements that are children of that Keystone id
- `parentOf` // filters all elements that are parent of that Keystone id
- `prevSiblingOf`: ID! // left sibling element, null if absent
- `nextSiblingOf`: ID! // right sibling element, null if absent

#### Mutation

##### Create and Update

- `parentId`: ID // Keystone id of direct parent element
- `prevSiblingId`: ID // Keystone id of left sibling element
- `nextSiblingId`: ID // Keystone id of right sibling element

##### Delete

If node has children they move to the parent of deleted node
