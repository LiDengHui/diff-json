
# diffJson

[Chinese](./README_zh.md)
[English](./README.md)

`diffJson` is a utility for comparing two JSON objects and generating a detailed list of changes (additions, deletions, modifications). It supports nested objects and arrays, and allows you to configure which paths to include or exclude from the comparison.

## Features
- **Object and Array Comparison**: Compare nested objects and arrays for changes.
- **Custom Descriptions**: Customize how the changes are described.
- **Path Filtering**: Include or exclude specific paths during the comparison.
- **Flexible Configuration**: Tailor the diff behavior with various configuration options.

## Installation

You can import and use the `diffJson` function directly in your project:

```javascript
import diffJson from '@dhlx/diff-json';
```

## Usage

### Basic Example

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

### Expected Output

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

### `DiffJsonConfig` Configuration Options

The `diffJson` function can accept a configuration object that allows you to control which paths to include/exclude, how arrays are compared, and how the descriptions are generated.

#### Configuration Options

- **`include` (string[])**: An array of strings representing the paths you want to include in the diff.
- **`exclude` (string[])**: An array of strings representing the paths you want to exclude from the diff.
- **`diffArrayKeys` (Array<{ name: string; key?: string }>)**: A configuration for comparing array elements based on specific keys.
- **`descriptions` (function)**: A custom function to generate the description of the change, based on the change type, object type, old and new values, etc.

#### Example Configuration

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

### Usage with Config

```javascript
const changes = diffJson(oldJson, newJson, config);
console.log(changes);
```

### Expected Output with Config

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

### Parameters

- **`oldJson` (any)**: The original JSON object to compare.
- **`newJson` (any)**: The updated JSON object to compare.
- **`config` (DiffJsonConfig, optional)**: Configuration object for customizing the diff behavior.

### Returns

The function returns an array of `ChangeNode` objects representing the changes between the two JSON objects.

### `ChangeNode`

Each change in the diff is represented as a `ChangeNode`:

```typescript
interface ChangeNode {
  type: ChangeType;  // The type of change: 'Add', 'Modified', 'Delete'
  key: string;       // The path to the changed element
  value: string;     // The value of the element after the change
  description: string;  // A description of the change
}
```

### `ChangeType`

An enum that defines the possible types of changes:

```typescript
enum ChangeType {
  Delete = 'Delete',
  Modified = 'Modified',
  Add = 'Add',
}
```

### `ChangeObjectType`

An enum that defines the object type (Array, Element, Object):

```typescript
enum ChangeObjectType {
  Array = 'Array',
  Element = 'Element',
  Object = 'Object',
}
```

### Example of `descriptions` Function

The `descriptions` function allows you to customize the way the description of changes is generated. Below is an example of a custom description for modified elements:

```javascript
const customDescriptions = (changeType, objectType, fullKey, key, oldValue, newValue, value) => {
  const action = changeType === ChangeType.Add ? 'added' : changeType === ChangeType.Delete ? 'deleted' : 'modified';
  return `${objectType} '${key}' was ${action} from '${JSON.stringify(oldValue)}' to '${JSON.stringify(newValue)}'`;
};
```

This would result in the following description for a modified element:

```json
{
  "type": "Modified",
  "key": "address.city",
  "value": "San Francisco",
  "description": "Object 'address.city' was modified from 'New York' to 'San Francisco'"
}
```

## Conclusion

This utility is ideal for comparing JSON objects and generating change logs with customizable descriptions. By using the `DiffJsonConfig` configuration options, you can tailor the comparison to meet your specific requirements, whether it's for ignoring certain paths, filtering arrays, or customizing the change descriptions.

