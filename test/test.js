import test from 'ava'
import { diffJson, ChangeType } from '../dist/index.js' // 请替换为实际文件路径

test('diffJson should return correct changes for added fields', t => {
  const oldJson = {
    users: [{ id: 1, name: 'Alice' }]
  }
  const newJson = {
    users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
  }

  const config = {
    include: ['users'] // 只比较 users 字段
  }

  const changes = diffJson(oldJson, newJson, config)

  t.is(changes.length, 1)
  t.deepEqual(changes[0], {
    type: ChangeType.Add,
    key: 'users.1',
    value: '{"id":2,"name":"Bob"}',
    description: "Array element 'users.1' added with value {\"id\":2,\"name\":\"Bob\"}"
  })
})

test('diffJson should return correct changes for modified fields', t => {
  const oldJson = {
    users: [{ id: 1, name: 'Alice' }]
  }
  const newJson = {
    users: [{ id: 1, name: 'Alice Updated' }]
  }

  const config = {
    include: ['users.[*].name']
  }

  const changes = diffJson(oldJson, newJson, config)

  t.is(changes.length, 1)
  t.deepEqual(changes[0], {
    type: ChangeType.Modified,
    key: 'users.0.name',
    value: '"Alice Updated"',
    description: "Element element 'users.0.name' modified from \"Alice\" to \"Alice Updated\""
  })
})

test('diffJson should return correct changes for deleted fields', t => {
  const oldJson = {
    users: [{ id: 1, name: 'Alice' }]
  }
  const newJson = {
    users: []
  }

  const config = {
    include: ['users']
  }

  const changes = diffJson(oldJson, newJson, config)

  t.is(changes.length, 1)
  t.deepEqual(changes[0], {
    type: ChangeType.Delete,
    key: 'users.0',
    value: '{"id":1,"name":"Alice"}',
    description: "Array element 'users.0' deleted with value {\"id\":1,\"name\":\"Alice\"}"
  })
})

test('diffJson should respect include and exclude config', t => {
  const oldJson = {
    users: [{ id: 1, name: 'Alice' }],
    settings: { theme: 'dark', notifications: true }
  }
  const newJson = {
    users: [{ id: 1, name: 'Alice' }],
    settings: { theme: 'light', notifications: false }
  }

  const config = {
    include: [],
    exclude: ['settings.theme'] // 排除 settings.theme 字段
  }

  const changes = diffJson(oldJson, newJson, config)

  t.is(changes.length, 1)  // 只有 users 字段的变化
  t.deepEqual(changes[0], {
    type: ChangeType.Modified,
    key: 'settings.notifications',
    value: 'false',
    description: "Element element 'settings.notifications' modified from true to false"
  })
})

test('diffJson should handle diffArrayKeys configuration', t => {
  const oldJson = {
    users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
  }
  const newJson = {
    users: [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]
  }

  const config = {
    diffArrayKeys: [{ name: 'users', key: 'id' }]  // 通过 id 进行比对
  }

  const changes = diffJson(oldJson, newJson, config)

  t.is(changes.length, 2)
  t.deepEqual(changes[0], {
    type: ChangeType.Delete,
    key: 'users.2',
    value: '{"id":2,"name":"Bob"}',
    description: "Array element 'users.2' deleted with value {\"id\":2,\"name\":\"Bob\"}"
  })
  t.deepEqual(changes[1], {
    type: ChangeType.Add,
    key: 'users.3',
    value: '{"id":3,"name":"Charlie"}',
    description: "Array element 'users.3' added with value {\"id\":3,\"name\":\"Charlie\"}"
  })
})
