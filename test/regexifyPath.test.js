import test from 'ava';
import { regexifyPath } from '../dist/index.js';  // 假设你的函数在 path.js 中

test('regexifyPath should correctly transform patterns', t => {
  const pattern1 = '[*].name';
  const regex1 = regexifyPath(pattern1);
  t.true(regex1.test('123.name'));  // 测试是否匹配
  t.true(regex1.test('abc.name')); // 测试是否不匹配

  const pattern2 = 'users.[*].id';
  const regex2 = regexifyPath(pattern2);
  t.true(regex2.test('users.123.id')); // 测试是否匹配
  t.true(regex2.test('users.abc.id')); // 测试是否不匹配

  const pattern3 = 'items.[*].name.[*]';
  const regex3 = regexifyPath(pattern3);
  t.true(regex3.test('items.123.name.456')); // 测试是否匹配
  t.true(regex3.test('items.123.name.abc')); // 测试是否不匹配
});