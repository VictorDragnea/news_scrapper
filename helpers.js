const axios = require('axios');
const cheerio = require('cheerio');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const HtmlDocx = require('html-docx-js');

const gCardClass = '.ftSUBd';
const headers = {
	'User-agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
	cookie: 'CONSENT=YES+cb.20211130-10-p0.ro+FX+488',
};

const getGoogleNewsHeadlines = (url) => {
	let encodedUrl = encodeURI(url);

	return axios
		.get(encodedUrl, { headers: headers })
		.then((response) => {
			const { data } = response;
			const $ = cheerio.load(data);
			const headlines = [];
			console.log('==============>', response);

			$(gCardClass, data).each(function () {
				const url = $(this).find('a').attr('href');
				const title = $(this).find('a span:first').text();
				const publisher = $(this).find('a span').eq(1).text().trim();

				// const rootUrl = rawUrl.split('/url?q=')[1];
				// if (!rootUrl) {
				// 	return;
				// }
				// const url = rootUrl.split('&sa')[0];

				headlines.push({
					title,
					url,
					publisher,
				});
			});

			return headlines;
		})
		.catch((error) => {
			console.log(error);
		});
};

const getArticlesFromHeadlines = (headlines) => {
	// if (!headlines) {
	// 	return '';
	// }
	let headlinesWithArticle = headlines.map((item) => {
		if (!item.url) {
			return '';
		}

		return axios
			.get(item.url)
			.then(async (response) => {
				var article = {};
				const { data } = response;
				const doc = new JSDOM(data);

				// let documentClone = doc.window.document.cloneNode(true);
				// let reader = new Readability(documentClone);

				let reader = new Readability(doc.window.document);
				let readerArticle = await reader.parse();
				// console.log('reader', readerArticle.textContent);

				if (
					readerArticle.title &&
					readerArticle.textContent &&
					item.url
				) {
					article = {
						title: readerArticle.title,
						text: readerArticle.textContent,
						link: item.url,
					};
				}

				// writeArticleToWordDocument(article);

				return article;
			})
			.catch(() => {
				return;
			});
	});

	return Promise.all(headlinesWithArticle).then(function (results) {
		// console.log('results', results);
		return results;
	});
};

const writeArticleToWordDocument = async (data) => {
	console.log('IntraaaAAAAaa');
	let documentName = getDocumentName();

	fs.writeFile(documentName, '', function (err) {
		if (err) throw err;
	});

	let storage = '';
	let index = 0;

	data.forEach((element) => {
		element.forEach((item) => {
			if (item) {
				index += 1;
				let articleItem =
					index +
					'<br/>' +
					'<h3><b>' +
					item.title +
					'</b></h3>' +
					'<br/>' +
					item.text +
					'<br/><br/>' +
					'<a href="' +
					item.link +
					'">' +
					item.link +
					'</a>' +
					'<br/>' +
					'===========================================================================' +
					'<br/><br/>';
				storage += articleItem;
			}
		});
	});

	var converted = await HtmlDocx.asBlob(storage);

	var logger = fs.createWriteStream(documentName, {
		flags: 'a', // 'a' means appending (old data will be preserved)
		// encoding: 'utf-8',
	});

	await logger.write(converted);
};

const getDocumentName = () => {
	const monthNames = [
		'Ianuarie',
		'Februarie',
		'Martie',
		'Aprilie',
		'Mai',
		'Iunie',
		'Iulie',
		'August',
		'Septembrie',
		'Octombrie',
		'Noiembrie',
		'Decembrie',
	];

	const d = new Date();
	let documentName = `Test | Raport presa ${d.getDate()} ${
		monthNames[d.getMonth()]
	} ${d.getFullYear()}.doc`;

	return documentName;
};

module.exports = {
	getGoogleNewsHeadlines: getGoogleNewsHeadlines,
	getArticlesFromHeadlines,
	writeArticleToWordDocument,
};
