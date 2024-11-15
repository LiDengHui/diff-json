# diffJson

[Chinese](./README_zh.md)
[English](./README.md)

`diffJson` 是一个用于比较两个 JSON 对象并生成详细更改记录的工具（包括添加、删除、修改）。它支持嵌套的对象和数组，并允许您配置要包含或排除的路径。

## 特性

- **对象和数组比较**：比较嵌套的对象和数组，检查更改。
- **自定义描述**：可以自定义如何描述这些更改。
- **路径过滤**：包含或排除特定路径进行比较。
- **灵活的配置**：通过不同的配置选项调整差异比较的行为。

## 安装

您可以直接在项目中导入并使用 `diffJson` 函数：

```javascript
import diffJson from '@dhlx/diff-json';
```

## 使用

### 基本示例

```javascript
const oldJson = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'coding'],
  address: { street: '123 Main St', city: 'New York' }
};

const newJson = {
  name: 'John',
  age: 31,  // Modified
  hobbies: ['reading', 'traveling'],  // Modified
  address: { street: '123 Main St', city: 'San Francisco', postalCode: '94101' }  // Added
};

const changes = diffJson(oldJson, newJson);
console.log(changes);
```

### 预期输出

```javascript
[
  {
    type: 'Modified',
    key: 'age',
    value: '31',
    description: "Object 'age' was modified from 30 to 31"
  },
  {
    type: 'Modified',
    key: 'hobbies[1]',
    value: 'traveling',
    description: "Array 'hobbies[1]' was modified from 'coding' to 'traveling'"
  },
  {
    type: 'Add',
    key: 'address.postalCode',
    value: '94101',
    description: "Object 'address.postalCode' was added with value '94101'"
  }
]
```

### `DiffJsonConfig` 配置选项

`diffJson` 函数可以接受一个配置对象，允许您控制哪些路径包含或排除在比较中，如何比较数组，以及如何生成描述。

#### 配置选项

- **`include` (string[])**: 一个字符串数组，表示您希望包含在差异比较中的路径。
- **`exclude` (string[])**: 一个字符串数组，表示您希望从差异比较中排除的路径。
- **`diffArrayKeys` (Array<{ name: string; key?: string }>)**: 配置如何根据特定键比较数组元素。
- **`descriptions` (function)**: 一个自定义函数，根据更改类型、对象类型、旧值和新值等生成更改的描述。

#### 示例配置

```javascript
const config = {
  include: ['name', 'hobbies', 'address.city'],  // Only compare 'name', 'hobbies', and 'address.city'
  exclude: ['age'],  // Exclude the 'age' field
  diffArrayKeys: [
    { name: 'hobbies', key: 'name' },  // Compare elements inside 'hobbies' array by their 'name' property
  ],
  descriptions: (changeType, objectType, fullKey, key, oldValue, newValue, value) => {
    // Custom description logic
    const baseDescription = `${objectType} '${key}' was ${changeTypeToStr(changeType)}`;
    if (changeType === ChangeType.Modified) {
      return `${baseDescription} from '${JSON.stringify(oldValue)}' to '${JSON.stringify(newValue)}'`;
    }
    return `${baseDescription} with value ${JSON.stringify(value)}`;
  }
};
```

### 配置使用示例

```javascript
const changes = diffJson(oldJson, newJson, config);
console.log(changes);
```

### 使用配置后的预期输出

```javascript
[
  {
    type: 'Modified',
    key: 'hobbies[1]',
    value: 'traveling',
    description: "Array 'hobbies[1]' was modified from 'coding' to 'traveling'"
  },
  {
    type: 'Add',
    key: 'address.postalCode',
    value: '94101',
    description: "Object 'address.postalCode' was added with value '94101'"
  }
]
```

### 参数

- **`oldJson` (any)**: 要比较的原始 JSON 对象。
- **`newJson` (any)**: 要比较的更新后的 JSON 对象。
- **`config` (DiffJsonConfig, 可选)**: 自定义配置对象，用于定制差异比较的行为。

### 返回值

该函数返回一个包含 `ChangeNode` 对象的数组，表示两个 JSON 对象之间的更改。

### `ChangeNode`

每个更改在差异中都表示为一个 `ChangeNode`：

```typescript
interface ChangeNode {
  type: ChangeType;  // 更改类型：'Add'、'Modified'、'Delete'
  key: string;       // 更改元素的路径
  value: string;     // 更改后的元素值
  description: string;  // 更改描述
}
```

### `ChangeType`

这是一个定义可能更改类型的枚举：

```typescript
enum ChangeType {
  Delete = 'Delete',
  Modified = 'Modified',
  Add = 'Add',
}
```

### `ChangeObjectType`

这是一个定义对象类型（数组、元素、对象）的枚举：

```typescript
enum ChangeObjectType {
  Array = 'Array',
  Element = 'Element',
  Object = 'Object',
}
```

### `descriptions` 函数示例

`descriptions` 函数允许您自定义生成更改描述的方式。以下是一个自定义描述函数示例，用于修改元素的描述：

```javascript
const customDescriptions = (changeType, objectType, fullKey, key, oldValue, newValue, value) => {
  const action = changeType === ChangeType.Add ? 'added' : changeType === ChangeType.Delete ? 'deleted' : 'modified';
  return `${objectType} '${key}' was ${action} from '${JSON.stringify(oldValue)}' to '${JSON.stringify(newValue)}'`;
};
```

这将生成如下描述：

```json
{
  "type": "Modified",
  "key": "address.city",
  "value": "San Francisco",
  "description": "Object 'address.city' was modified from 'New York' to 'San Francisco'"
}
```

## 总结

这个工具非常适合比较 JSON 对象并生成变更日志，具有自定义描述的功能。通过使用 `DiffJsonConfig`
配置选项，您可以根据需要调整比较行为，无论是用于忽略某些路径、比较数组元素，还是自定义更改描述。
