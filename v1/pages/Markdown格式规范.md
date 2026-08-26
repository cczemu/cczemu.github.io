# Markdown 标准格式规范

## 1. 标题
# 一级标题
```markdown
# 一级标题
```
## 二级标题
```markdown
## 二级标题
```
### 三级标题
```markdown
### 三级标题
```

## 2. 段落与换行
段落之间空一行。
行尾加两个空格可实现换行。
```markdown
段落之间空一行。
行尾加两个空格可实现换行。  
下一行
```

## 3. 强调
*斜体* 或 _斜体_
```markdown
*斜体* 或 _斜体_
```
**加粗** 或 __加粗__
```markdown
**加粗** 或 __加粗__
```
***加粗斜体*** 或 ___加粗斜体___
```markdown
***加粗斜体*** 或 ___加粗斜体___
```

## 4. 列表
- 无序列表项一
- 无序列表项二
```markdown
- 无序列表项一
- 无序列表项二
```
1. 有序列表项一
2. 有序列表项二
```markdown
1. 有序列表项一
2. 有序列表项二
```

## 5. 链接与图片
[链接文本](https://example.com)
```markdown
[链接文本](https://example.com)
```
![图片描述](https://picsum.photos/200/)
```markdown
![图片描述](https://example.com/image.png)
```

## 6. 引用
> 这是引用内容

> 这是引用内容
>> 嵌套引用
```markdown
> 这是引用内容
>> 嵌套引用
```

## 7. 代码
行内代码：`code`
```markdown
`code`
```
代码块：
```js
console.log('代码块');
```
```markdown
```js
console.log('代码块');
```
```

## 8. 分割线
---
```markdown
---
```

## 9. 表格
| 表头1 | 表头2 |
| ----- | ----- |
| 内容1 | 内容2 |
```markdown
| 表头1 | 表头2 |
| ----- | ----- |
| 内容1 | 内容2 |
```

## 10. 任务列表
- [x] 已完成
- [ ] 未完成
```markdown
- [x] 已完成
- [ ] 未完成
```

```
// 运行：node gen-pages-index.js
// 作用：生成 pages/index.json，包含 pages 目录下所有 .md 文件名

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const outFile = path.join(__dirname, 'index.json');

fs.readdir(pagesDir, (err, files) => {
  if (err) throw err;
  const mdFiles = files.filter(f => f.endsWith('.md'));
  fs.writeFileSync(outFile, JSON.stringify(mdFiles, null, 2), 'utf-8');
  console.log('已生成:', outFile);
});
```
