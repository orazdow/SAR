const Mastodon = require('mastodon-api');

const ignores = ['102883438707628266','102860765893027028'];
// const testRoot = '102893816974487737';

const list = process.argv[2] == 'list' ? true : false;
const tree = process.argv[2] == 'tree' ? true : false;

const M = new Mastodon({
  access_token: 'ucWy4RVspk_dd3WltM6hkCxB-t79W8a5L9E1jhG3KsA',
  client_Secret: 'lv73u8daG5qvSqtiVWR3ORDUxCsJebe8Ut-MEmWaaqA',
  client_key: 'Bh8db_Smd21NE0lSY-tElw3MT0WKe20mQh-7Uro9CI0',
  timeout_ms: 60*1000,
  api_url: 'https://m.speculativeartsresearch.com/api/v1/',
});

let topchain = [];
let idmap = {};
let root = null;

const getChain = async (M, roots, cb)=>{

	let chains = [];

	for(let i = 0; i < roots.length; i++){

		chains.push(new Array(roots[i]));
		let r_id = chains[i][0].id;
		await M.get('statuses/'+r_id+'/context', (err, data, res)=>{
			chains[i] = chains[i].concat(data.descendants);
		});

	}

	cb(chains);

};

function indexIds(topchain, dict){
	for(let chain of topchain){
		for(let el of chain){
			dict[el.id] = miniNode(el);
		}
	}
}

function miniNode(el){
	return {
		name : el.id,
		attributes : void 0,
		status: el,
		children : []
	};
}

function connectNodes(map){
	var keys = Object.keys(map);

	for(var i =  keys.length-1; i >= 0; i--){
		let child = map[keys[i]];
		let parent = map[child.status.in_reply_to_id];
		if(child && parent){
			if(!(child.status.account.username == "Annotator1")){
				parent.children.push(child);
			}
			else{
				// annotate data
			}
		}
	}
}

function dateStr(datestr){
	let dt = new Date(datestr);
	return dt.getUTCMonth()+1+'/'+dt.getDate()+'/'+'19'+' '+d(dt.getUTCHours(), dt.getMinutes());

	function d(h, m){
	  return (h == 0 ? '12:'+m+'am' : h-12 < 0 ? h+':'+m+'am' : h-12 == 0 ? '12:'+m+'pm' : h-12+':'+m+'pm')+" gmt";
	}
}

function fixBlunders(str){
	str = str.replace(/I&gt/g, 'i&gt');
	str = str.replace(/<br\/>/g, '<br>');
	str = str.replace(/<br \/>/g, '<br>');
	let i = str.indexOf('/i&gt;');
	if(i < 0) return str;
	if(str.charAt(i+6) != ' '){
	   return str.substr(0, i+6)+' '+str.substr(i+6);
	}
	return str;
}

function slashItalics(str){
	let hrefs = (str.match(/\"http(.*?)\"/gm) || []);
	for(let i = 0; i < hrefs.length; i++){
		str = str.replace(hrefs[i], '#*'+i);
	}
	str = str.replace(/(?<=[a-zA-Z0-9])(\/)(?=[a-zA-Z0-9])/gm, '##*');
	let num = (str.match(/(?<!<|< )(\/)/gm)|| []).length;
	if(num%2 != 0) num = num-1;
	for(let i = 0; i < num; i++){
		str = str.replace(/(?<!<|< )(\/)/,  ((i%2) == 0 )? '<i>' : '<~*i>');
	}
	str = str.replace(/~\*/gm, '/');
	str = str.replace(/##\*/gm, '/');
	for(let i = 0; i < hrefs.length; i++){
		str = str.replace('#*'+i, hrefs[i]);
	}
	return str;
}

function contentStr(str){
	str = fixBlunders(str);
	str = str.replace(/&gt;/g, '>');
	str = str.replace(/&lt;/g, '<');
	str = str.replace(/&quot;/g, '"');
	str = str.replace(/&apos;/g, "'");
	str = str.replace(/&amp;/g, '&');
	str = slashItalics(str);
	return str.match(/(?<=<p>)(.*)(?=<\/p>)/gm)[0];
}

function ttsStr(str){
	return str.replace(/(<\/p>)/gm, ' ').replace(/<.*?>/g, '').replace(/@(.*?) /gm, '').replace(/¹/g, '1').replace(/(\.)(?!\.| )/gm, '. ');
}

M.get('timelines/home', (err, data, res)=>{

		let filt = data.filter((el)=>{
			return !ignores.includes(el.id);
		});

		getChain(M, filt, (ret)=>{

			for(let chain of ret){
				for(let el of chain){

					el.has_media = el.media_attachments[0] ? true : false;
					el.datestr = dateStr(el.created_at);
					el.content_text = contentStr(el.content);
					el.content_tts = ttsStr(el.content_text);

				}

				topchain = ret;
				indexIds(topchain, idmap);
				connectNodes(idmap);
				// root = [];
				// for(chain of topchain){
				// 	root.push(idmap[chain[0].id]);
				// }
				root = idmap[topchain[topchain.length-1][0].id];

			}

			if(list){
				console.log(topchain[topchain.length-1].length);
			}
			else if(tree){
				 console.log(JSON.stringify(root, null, '\t'));
			}else{
				 console.log(JSON.stringify(topchain, null, '\t'));
			}

		});

}).catch(err => console.log(err)).then(()=>{

	// console.log('\nDONE');

});
