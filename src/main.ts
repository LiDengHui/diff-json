import diffJson from '../lib/main.ts'

const oldJson = {
  users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
}
const newJson = {
  users: [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }]
}

const config = {
  diffArrayKeys: [{ name: 'users', key: 'id' }]  // 通过 id 进行比对
}


const result = diffJson(oldJson, newJson, config);

console.log(result)