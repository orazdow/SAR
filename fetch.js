const Mastodon = require('mastodon-api');
const fs = require('fs');

const ignores = ['102883438707628266','102860765893027028']; 
const statuses_file = 'sar_statuses.json';
const tree_file = 'sar_tree.json';
const cmd = process.argv[2]; 

const M = new Mastodon({
  access_token: 'ucWy4RVspk_dd3WltM6hkCxB-t79W8a5L9E1jhG3KsA',
  client_Secret: 'lv73u8daG5qvSqtiVWR3ORDUxCsJebe8Ut-MEmWaaqA',
  client_key: 'Bh8db_Smd21NE0lSY-tElw3MT0WKe20mQh-7Uro9CI0',
  timeout_ms: 60*1000, 
  api_url: 'https://m.speculativeartsresearch.com/api/v1/', 
});


if(!cmd || cmd == 'request'){
	requestData();
}
if(cmd == 'build'){
	buildTreeFromFile();
}


// request data and write file, build tree (arg: 'request' or '')
function requestData(){
	let topchain = [];

	M.get('timelines/home', (err, data, res)=>{

		let filt = data.filter((el)=>{
			return !ignores.includes(el.id);
		});

		getChain(M, filt, (ret)=>{

			topchain = ret;
			// write statuses file 
			fs.writeFile(statuses_file, JSON.stringify(ret, null, '\t'), 'utf8', (err)=>{
				if (err) throw err;
				console.log('returned mastodon data len:', ret[ret.length-1].length);

				// build tree
				if(!cmd){ 
					let tree = buildTree(topchain);
					fs.writeFile(tree_file, JSON.stringify(tree, null, '\t'), 'utf8', (err)=>{
						if(err) throw err;
						console.log('tree built');
					});
				}

			});

		});

	}).catch(err => console.log(err)).then(()=>{ /* */ });
}

// build tree from file (arg: 'build')
function buildTreeFromFile(){
	fs.readFile('./'+statuses_file, 'utf8', (err, data)=>{
    	if(err) throw err;

		let tree = buildTree(JSON.parse(data));

		fs.writeFile(tree_file, JSON.stringify(tree, null, '\t'), 'utf8', (err)=>{
			if(err) throw err;
			console.log('tree built');
		});

	});
}

// append replies
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

// construct tree 
function buildTree(topchain){
	let idmap = {};
	for(let chain of topchain){
		for(let el of chain){

			el.has_media = el.media_attachments[0] ? true : false;
			el.datestr = dateStr(el.created_at);
			el.content_text = contentStr(el.content);
			el.content_tts = ttsStr(el.content_text);
			inlineParams(el);
		}
	}

	indexIds(topchain, idmap);
	connectNodes(idmap);
	let root = idmap[topchain[topchain.length-1][0].id];
	postProc(root, idmap);
	return root;
}


function indexIds(topchain, dict){
	for(let chain of topchain){
		for(let el of chain){
			dict[el.id] = miniNode(el);
		}
	}
}

function miniNode(el){
	let node = {
		name : el.id,
		attributes : null,
		status: el,
		children : []
	};
	if(el.params && el.params.portal){
		node.portal = el.params.portal;
		node.nodeSvgShape = {
			shapeProps : {
				shape : 'circle',
				fill : '#22aa55',
				r : 10
			}
		}
	}
	return node;
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

function dfs(node, cb){
	let i = 1;
	if(cb)cb(node);
	for(let n of node.children){
		i += dfs(n, cb);
	}
	return i;
}

function postProc(root, map){
	dfs(root, (node)=>{ 
		if(node.portal){ 
			let n = map[node.portal];
			n.portal_from = node.name;
		}
	});
}

function inlineParams(status){
	let str = status.content;
	let p = getParams(str);
	if(!p) return;
	let params = {};
	for(let pair of p){
		if(isNaN(parseFloat(pair[0])))
		params[pair[0]] = pair[1]; 
	}
	if(Object.keys(params).length){status.params = params;}
}

function getParams(str){
    str = (str.match(/(?<={)(.*?)(?=})/gm)||[])[0];
    if(!str) return null;
	str = str.replace(/( )/gm, '');
    let arr = str.split(',').map(p => p.split('=')).filter(el => el.length == 2);
    return arr;
}

function jsonVal(str){
    return !isNaN(parseFloat(str)) ? parseFloat(str) : (str == 'true' || str == 'false')? (str == 'true') : str;
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
	return str.replace(/(<\/p>)/gm, ' ')
	.replace(/<.*?>/g, '')
	.replace(/{(.*?)}/gm, '')
	.replace(/@(.*?) /gm, '')
	.replace(/¹/g, '1')
	.replace(/(\.)(?!\.| )/gm, '. ')
	.replace(/END/gm, ' ');
}
