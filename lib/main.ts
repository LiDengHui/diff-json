export enum ChangeType {
  Delete = 'Delete',
  Modified = 'Modified',
  Add = 'Add',
}

export enum ChangeObjectType {
  Array = 'Array',
  Element = 'Element',
  Object = 'Object',
}

export interface ChangeNode {
  type: ChangeType
  key: string
  value: string
  description: string
}

export interface DiffJsonConfig {
  include?: string[]
  exclude?: string[]
  diffArrayKeys?: { name: string; key?: string }[]
  descriptions?: (
    changeType: ChangeType,
    objectType: ChangeObjectType,
    fullKey: string,
    key: string,
    oldValue: any,
    newValue: any,
    value: any,
  ) => string // 自定义描述生成方法，接受 oldValue 和 newValue
}

const isObject = (value: any): boolean =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isArray = Array.isArray

const getKeyForArrayElement = (
  item: any,
  arrayKey: string | undefined,
  index: number
): any =>
  arrayKey && isObject(item) && item[arrayKey] !== undefined
    ? item[arrayKey]
    : index

const changeTypeToStr = (type: ChangeType) => {
  switch (type) {
    case ChangeType.Add:
      return 'added'
    case ChangeType.Modified:
      return 'modified'
    case ChangeType.Delete:
      return 'deleted'
    default:
      return 'undefined'
  }
}

const defaultDescription = (
  changeType: ChangeType,
  objectType: ChangeObjectType,
  fullKey: string,
  key: string,
  oldValue: any,
  newValue: any,
  value: any,
) => {
  const pre = `${objectType} element '${childPath(fullKey, key)}' ${changeTypeToStr(changeType)}`
  if (changeType === ChangeType.Modified) {
    return `${pre} from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`
  }
  return `${pre} with value ${JSON.stringify(value)}`
}

function createChangeNode(
  changeType: ChangeType,
  objectType: ChangeObjectType,
  fullKey: string,
  key: any,
  oldValue: any,
  newValue: any,
  item: any,
  config?: DiffJsonConfig
): ChangeNode {
  const description = config?.descriptions
    ? config.descriptions(
        changeType,
        objectType,
        fullKey,
        key,
        oldValue,
        newValue,
        item,
      )
    : defaultDescription(
        changeType,
        objectType,
        fullKey,
        key,
        oldValue,
        newValue,
         item,
      )

  return {
    type: changeType,
    key: childPath(fullKey, key),
    value: JSON.stringify(item),
    description,
  }
}

function compareArrayItems(
  oldArrayMap: Map<any, { item: any; index: number }>,
  newArrayMap: Map<any, { item: any; index: number }>,
  fullKey: string,
  config: DiffJsonConfig,
  changes: ChangeNode[]
): void {
  for (const key of new Set([...oldArrayMap.keys(), ...newArrayMap.keys()])) {
    const oldEntry = oldArrayMap.get(key)
    const newEntry = newArrayMap.get(key)

    if (oldEntry && !newEntry) {
      changes.push(
        createChangeNode(
          ChangeType.Delete,
          ChangeObjectType.Array,
          fullKey,
          key,
          oldEntry.item,
          undefined,
          oldEntry.item,
          config
        )
      )
    } else if (!oldEntry && newEntry) {
      changes.push(
        createChangeNode(
          ChangeType.Add,
          ChangeObjectType.Array,
          fullKey,
          key,
          undefined,
          newEntry.item,
          newEntry.item,
          config
        )
      )
    } else if (oldEntry && newEntry) {
      compareElements(
        oldEntry.item,
        newEntry.item,
        fullKey,
        key,
        config,
        changes
      )
    }
  }
}

const childPath = (parentKey: string, key: string) => {
  return parentKey === '' ? key : `${parentKey}.${key}`
}

function compareElements(
  oldItem: any,
  newItem: any,
  fullKey: string,
  key: any,
  config: DiffJsonConfig,
  changes: ChangeNode[]
): void {
  if (isObject(oldItem) && isObject(newItem)) {
    compareObjects(oldItem, newItem, childPath(fullKey, key), config, changes)
  } else if (isArray(oldItem) && isArray(newItem)) {
    compareArrays(oldItem, newItem, childPath(fullKey, key), config, changes)
  } else if (oldItem !== newItem) {
    changes.push(
      createChangeNode(
        ChangeType.Modified,
        ChangeObjectType.Element,
        fullKey,
        key,
        oldItem,
        newItem,
        newItem,
        config
      )
    )
  }
}

function compareArrays(
  oldArray: any[],
  newArray: any[],
  fullKey: string,
  config: DiffJsonConfig,
  changes: ChangeNode[]
): void {
  const arrayConfig = (config.diffArrayKeys ?? []).find((entry) =>
    fullKey.includes(entry.name)
  )
  const arrayKey = arrayConfig?.key
  const getMap = (arr: any[]) =>
    new Map(
      arr.map((item, index) => [
        getKeyForArrayElement(item, arrayKey, index),
        { item, index },
      ])
    )

  compareArrayItems(
    getMap(oldArray),
    getMap(newArray),
    fullKey,
    config,
    changes
  )
}

export const regexifyPath = (pattern: string) => {
  const regexPattern = pattern
    .replace(/\[\*\]/g, '([^\\.]+)') // 匹配任意字符（不包含点）
    .replace(/\./g, '\\.') // 转义点（.）字符，以便它能被当作字面上的点处理

  // 创建并返回正则表达式对象，匹配整个字符串
  return new RegExp(`^${regexPattern}$`)
}

// 根据include判断符合条件的path
const includePathValidate = (
  includes: string[] = [],
  excludes: string[] = [],
  path: string
): boolean => {
  const isExcluded = excludes.some((pattern) =>
    regexifyPath(pattern).test(path)
  )
  if (isExcluded) {
    return false
  }

  if (includes?.length === 0) return true
  const _includes = includes.reduce((arr, a) => {
    const a_arr = a.split('.')
    a_arr.reduce((full, item) => {
      full = childPath(full, item)
      arr.add(full)
      return full
    }, '')
    return arr
  }, new Set<string>())
  return [..._includes].some((pattern) => regexifyPath(pattern).test(path))
}

function compareObjects(
  oldObj: any,
  newObj: any,
  fullKey: string,
  config: DiffJsonConfig,
  changes: ChangeNode[]
): void {
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ])

  for (const key of allKeys) {
    const subKey = childPath(fullKey, key)
    if (!includePathValidate(config.include, config.exclude, subKey)) {
      continue
    }

    const [oldValue, newValue] = [oldObj?.[key], newObj?.[key]]

    if (oldValue === undefined && newValue !== undefined) {
      changes.push(
        createChangeNode(
          ChangeType.Add,
          ChangeObjectType.Object,
          subKey,
          key,
          oldValue,
          newValue,
          newValue,
          config
        )
      )
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push(
        createChangeNode(
          ChangeType.Delete,
          ChangeObjectType.Object,
          subKey,
          key,
          oldValue,
          null,
          oldValue,
          config
        )
      )
    } else if (oldValue !== newValue) {
      compareElements(oldValue, newValue, fullKey, key, config, changes)
    }
  }
}

export function diffJson(
  oldJson: any,
  newJson: any,
  config?: DiffJsonConfig
): ChangeNode[] {
  const changes: ChangeNode[] = []
  compareObjects(oldJson, newJson, '', config || {}, changes)
  return changes
}

export default diffJson
