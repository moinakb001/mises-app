
import * as validURL from 'valid-url';
import * as jquery from 'jquery';
import * as jsdom from 'jsdom';
function getWindow(text) {
	return new Promise((res, rej) => {
		jsdom.env(text, (err, window) => {
			if (err) {
				rej(err);
			}
			res(window);
		})
	});
}
export async function getPage(num) {

	var request = await fetch('http://mises.org/wire?page=' + num);
	var textReq = await request.text();
	var window = await getWindow(textReq);

	var $ = jquery(window);
	var divs = $("#block-system-main")[0].children[0].children[0].children
	//console.log(divs[0].getElementsByClassName("body-content")[0].innerHTML);
	var imgs = Array.prototype.map.call(divs, x => x.getElementsByTagName("img")[0].src);
	var descs = Array.prototype.map.call(divs, x => {

		if (x.getElementsByClassName("body-content")[0].children.length == 0) {
			return x.getElementsByClassName("body-content")[0].innerHTML;
		}
		else {
			return x.getElementsByClassName("body-content")[0].children[0].innerHTML;
		}
	});
	var links = Array.prototype.map.call(divs, x => x.getElementsByTagName("a")[3].href);
	var titles = Array.prototype.map.call(divs, x => x.getElementsByTagName("a")[3].innerHTML);
	var authorLinks = Array.prototype.map.call(divs, x => x.getElementsByTagName("a")[4].href);
	var authors = Array.prototype.map.call(divs, x => x.getElementsByTagName("a")[4].innerHTML);
	var dates = Array.prototype.map.call(divs, x => x.getElementsByClassName("date")[0].innerHTML);
	var tags = Array.prototype.map.call(divs, x => {
		var ttt = x.getElementsByClassName("tags")[0];
		var resu = []
		if (ttt) {
			var childs = ttt.children;
			for (var ind = 0; ind < childs.length; ind++) {
				resu[ind] = childs[ind].children[0] ? childs[ind].children[0].innerHTML : childs[ind].innerHTML;
			}
		}
		return resu;
	});
	var result = [];
	for (var ind = 0; ind < divs.length; ind++) {
		var obj = {
			image: imgs[ind],
			description: descs[ind],
			article: (validURL.isHttpUri(links[ind]) || validURL.isHttpsUri(links[ind]))?links[ind]:"https://mises.org/" +links[ind],
			title: titles[ind],
			author: {
				name: authors[ind],
				link: authorLinks[ind]
			},
			date: dates[ind],
			tags: tags[ind]
		};
		result[ind] = obj;
	}
	return result;
}
async function getPageRange(num1, num2) {
	var pr = [];
	while (num1 <= num2) {
		pr.push(await getPage(num2))
		num2--;
	}
	return pr;
}
export async function getArticle(url) {
	var request = await fetch(url);
	var textReq = await request.text();
	var window = await getWindow(textReq);
	var $ = require("jquery")(window);
	var body = $(".body-content");
	return body[0].innerHTML;
}
