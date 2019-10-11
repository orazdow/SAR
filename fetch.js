const Mastodon = require('mastodon-api');

const ignores = ['102883438707628266','102860765893027028'];
// const testRoot = '102893816974487737';

const M = new Mastodon({
  access_token: 'ucWy4RVspk_dd3WltM6hkCxB-t79W8a5L9E1jhG3KsA',
  client_Secret: 'lv73u8daG5qvSqtiVWR3ORDUxCsJebe8Ut-MEmWaaqA',
  client_key: 'Bh8db_Smd21NE0lSY-tElw3MT0WKe20mQh-7Uro9CI0',
  timeout_ms: 60*1000, 
  api_url: 'https://m.speculativeartsresearch.com/api/v1/', 
});



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

M.get('timelines/home', (err, data, res)=>{

		let filt = data.filter((el)=>{
			return !ignores.includes(el.id);
		});
		// console.log(filt);

		getChain(M, filt, (ret)=>{

			for(let chain of ret){		
				for(let el of chain){

					el.has_media = el.media_attachments[0] ? true : false;
					if(el.has_media)
						el.media_attachments = JSON.stringify(el.media_attachments);

				}
			}

			console.log(ret);

		});

}).catch(err => console.log(err)).then(()=>{

	// console.log('\nDONE');

});
