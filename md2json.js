const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
let arr = [];
let links = [];

fs.readdirSync("posts/")
	.forEach((i) => {
		if (i.substring(i.lastIndexOf('.')) == ".md") {
			const data = fs.readFileSync(path.join(__dirname, "posts", i), 'utf-8');
			arr.push(matter(data).data)
		}
	})

function compareDate(a, b) {
	return new Date(b.date) - new Date(a.date);
}
arr.sort(compareDate);

for (const item of arr) {
	links.push(item.title + ".md");
}

console.log(links)
fs.writeFileSync(path.join(__dirname, 'links.json'), JSON.stringify(links));