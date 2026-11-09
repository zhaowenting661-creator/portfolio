(()=>{'use strict';
const $=id=>document.getElementById(id),app=document.querySelector('.app'),workspace=document.querySelector('.workspace'),asset=n=>'resource/imgs/competitor-comparison/'+n,ic=n=>'<img class="ui-icon" alt="" src="'+asset(n+'.svg')+'">',escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dictionary={'Home':'首页','AI Tools':'AI 工具','AI Insights':'AI 数据洞察','AI Generators':'AI 内容生成','Customer Reviews':'客户评价','Competitor Comparison':'AI竞品对比','AI Assistant':'AI 助手','Depth Analysis':'深度分析','Enter keywords to check history':'输入关键词搜索历史记录','Enter ASIN #, SKU # or keywords to search products.':'输入 ASIN、SKU 或关键词搜索商品','Search':'搜索','Import Product':'导入商品','New comparison':'新建对比','Comparison':'对比分析','Country':'国家/地区','Channel':'渠道','United States':'美国','Canada':'加拿大','New Chat':'新建对话','Please enter prompt':'请输入问题','Clear':'清空','Send':'发送','Cancel':'取消','Add to comparison':'添加到对比','Select products to add to your comparison. Compare 2–4 products at a time.':'选择需要对比的商品，每次可对比 2–4 件商品。','Product':'商品','Brand':'品牌','ASIN':'ASIN','Ratings':'评分','My Item':'我的商品','No Data':'暂无数据','Add products to start a new comparison.':'添加商品，开始新的竞品对比。','Import products':'导入商品','Comparative Analysis and Recommendations':'对比分析与优化建议','Overview':'概览','Key Strengths and Weaknesses':'核心优势与不足','Strengths':'优势','Weaknesses':'不足','Recommendations':'优化建议','Conclusion':'结论','Summary Table':'建议汇总','Improvement Area':'优化方向','Specific Action':'具体行动','Expected Benefit':'预期收益','Please select at least 2 products to compare.':'请至少添加 2 件商品后再开始对比。','You can compare up to 4 products.':'最多可同时对比 4 件商品。','No matching products. Try an ASIN, SKU, or another keyword.':'未找到匹配商品，请尝试 ASIN、SKU 或其他关键词。','Select products before opening depth analysis.':'请先选择商品，再开启深度分析。','In depth analysis of history':'深度分析历史记录','Report downloaded':'报告已下载','Demo analysis uses local sample data.':'演示分析使用本地示例数据。','How can we optimize our pricing strategy to be competitive?':'如何优化定价策略，提升竞争力？','What are the main strengths and weaknesses of our product?':'我们的商品有哪些主要优势和不足？','How can we improve our product based on the analysis?':'根据分析结果，应该如何优化商品？','What market opportunities should we focus on?':'有哪些值得关注的市场机会？','Comparison history':'对比历史','Select country and channel':'选择国家/地区和渠道','Show comparison history':'展开对比历史','Hide comparison history':'收起对比历史','Expand sidebar':'展开侧边栏','Collapse sidebar':'收起侧边栏','Analysis history':'分析历史','Download report':'下载报告','Expand report':'放大报告','Close depth analysis':'关闭深度分析','Close import':'关闭导入弹窗','Analysis model':'分析模型'};
let language='en',used=0,selected=[null,null,null,null],activeHistory=null,historyPage=1,busy=false,analysisToken=0,reportReady=false,fullscreen=false,historyWasOpen=true,chatVersion=0;
const t=s=>language==='zh-CN'?(dictionary[s]||s):s,zh=(en,cn)=>language==='zh-CN'?cn:en;
const catalog=[{id:0,title:'Creativity for Kids Mini Mini Garden Dinosaur: Kit with Miniature Accessories',brand:'Lowepro',asin:'B089VLTR4H',sku:'MINI-001',price:13.75,rating:4.6,channel:'Amazon',photo:'source-3.png'},{id:1,title:'Creativity for Kids Mini Mini Garden Dinosaur: Kids Creative Kit',brand:'BAGSMART',asin:'08HCZS57B',sku:'MINI-002',price:13.75,rating:4.6,channel:'TikTok',photo:'source-3.png'},{id:2,title:'Creativity for Kids Mini Mini Garden Dinosaur: Learning and Play',brand:'BAGSMART',asin:'B09I8X422H',sku:'MINI-003',price:13.75,rating:4.7,channel:'Walmart',photo:'source-3.png'},{id:3,title:'Creativity for Kids Mini Mini Garden Dinosaur: Children’s Craft Kit',brand:'Golkcurx',asin:'B09I8X422J',sku:'MINI-004',price:13.75,rating:4.7,channel:'TikTok',photo:'source-3.png'},{id:4,title:'Intel Core i5 Processor — Desktop CPU',brand:'Intel',asin:'B08J63ST2W',sku:'CORE-I5',price:219.99,rating:4.8,channel:'Amazon',photo:'source-3.png'},{id:5,title:'Elmer’s Disappearing Purple School Glue Sticks — 30 Pack',brand:'Elmer’s',asin:'B00WGLUE30',sku:'GLUE-030',price:12.99,rating:4.8,channel:'Walmart',photo:'source-4.jpg'}];
// Local demo products let each saved comparison restore its own table and report.
catalog.push(
  {id:6,title:'Intel Core i5-12400F Desktop Processor',brand:'Intel',asin:'DEMO-CPU-01',sku:'CPU-12400F',price:129.99,rating:4.7,channel:'Amazon',photo:'source-3.png'},
  {id:7,title:'Intel Core i5-13400 Desktop Processor',brand:'Intel',asin:'DEMO-CPU-02',country:'CA',sku:'CPU-13400',price:189.99,rating:4.6,channel:'Amazon',photo:'source-3.png'},
  {id:8,title:'Intel Core i5-14400 Desktop Processor',brand:'Intel',asin:'DEMO-CPU-03',sku:'CPU-14400',price:209.99,rating:4.5,channel:'Amazon',photo:'source-3.png'},
  {id:9,title:'Elmer’s Washable School Glue Sticks — 12 Pack',brand:'Elmer’s',asin:'DEMO-GLUE-01',sku:'GLUE-012',price:6.49,rating:4.6,channel:'Amazon',photo:'source-4.jpg'},
  {id:10,title:'Elmer’s Disappearing Purple Glue Sticks — 24 Pack',brand:'Elmer’s',asin:'DEMO-GLUE-02',sku:'GLUE-024',price:10.49,rating:4.7,channel:'Amazon',photo:'source-4.jpg'},
  {id:11,title:'Elmer’s Washable School Glue Sticks — 60 Pack',brand:'Elmer’s',asin:'DEMO-GLUE-03',sku:'GLUE-060',price:24.99,rating:4.8,channel:'Amazon',photo:'source-4.jpg'}
);
const savedProductSets = [
  [0,1,2,3], [4,6,7,8], [5,9,10,11], [6,4,7,8], [9,5,10,11], [7,4,6,8],
  [10,5,9,11], [8,4,6,7], [11,5,9,10], [4,6,8], [5,9,11], [6,7,8],
  [9,10,11], [7,4,8], [10,5,11], [8,4,7], [11,5,10], [4,7,8]
];
const histories = savedProductSets.map((ids, index) => ({
  id: index,
  title: index === 0
    ? '100% Talalay Latex Pillow Bed Pillow for Sleeping Nespresso OriginalLine…'
    : catalog[ids[0]].title,
  ids,
  date: index === 0 ? '2024-04-13 15:02:27 CST' : new Date(Date.UTC(2024, 3, 13 - index, 15, 2, 27)).toISOString().slice(0, 19).replace('T', ' ') + ' CST',
  report: true,
  sample: index === 0
}));
let questions=[],messages=[],thinkingChat=false;
let activeQuestion = null;
const iconPaths={menu:'<path d="M3 5h14M3 10h14M3 15h14"/>',collapse:'<path d="M5 4h12M10 8h7M10 12h7M5 16h12M6 7l-3 3 3 3"/>',close:'<path d="m5 5 10 10M15 5 5 15"/>',fullscreen:'<path d="M7 2H2v5m11-5h5v5M2 13v5h5m6 0h5v-5"/>',depth:'<path d="m3 17 10-10 3 3L6 20Zm9-14 1-3 1 3 3 1-3 1-1 3-1-3-3-1ZM4 5v4M2 7h4"/>',send:'<path d="m2 3 16 7-16 7 3-7Zm3 7h10"/>',insights:'<path d="M2 18V2h16v16ZM5 14v-3m5 3V6m5 8V9"/>'};
const svg=k=>'<svg viewBox="0 0 20 20" aria-hidden="true">'+iconPaths[k]+'</svg>';
[['sidebar-toggle',svg('menu')],['insights-icon','<img class="ui-icon" alt="" src="'+asset('insights.png')+'">'],['history-search-icon',ic('search')],['history-hide',svg('collapse')],['history-show',svg('collapse')],['depth-icon',ic('report-wand')],['analysis-history',ic('report-history')],['download',ic('report-download')],['report-fullscreen',ic('report-fullscreen')],['chat-close',svg('close')],['new-comparison-close',svg('close')],['clear-icon',ic('trash')],['send-icon',svg('send')]].forEach(([id,html])=>$(id).innerHTML=html);
document.querySelector('.system-links .system-icon').innerHTML='<img class="ui-icon" alt="" src="'+asset('generators.png')+'">';
function translations(){document.documentElement.lang=language;document.documentElement.dataset.spLanguage=language;document.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));document.querySelectorAll('[data-placeholder]').forEach(e=>e.placeholder=t(e.dataset.placeholder));document.querySelectorAll('[aria-label]').forEach(e=>{e.dataset.originalLabel||=(e.getAttribute('aria-label'));e.setAttribute('aria-label',t(e.dataset.originalLabel));});$('quota-copy').innerHTML=zh('Each organization can generate up to <b>30</b> analyses for free per day. You can generate <b>'+(30-used)+'</b> more today.','每个组织每天可免费生成 <b>30</b> 次分析，今天还可生成 <b>'+(30-used)+'</b> 次。');}
function refresh(){translations();renderProducts();renderHistory();renderReport();renderChat();renderChannels();if($('new-comparison-dialog').open){renderComparisonExamples();renderComparisonInput();}}
function setLanguage(next,propagate=true){if(!['en','zh-CN'].includes(next))return;language=next;refresh();window.dispatchEvent(new CustomEvent('sellingpilot-language-changed',{detail:{language}}));if(propagate&&parent!==window)parent.postMessage({type:'sellingpilot-language',language},'*');}
window.SellingPilotI18n={getLanguage:()=>language,setLanguage,refresh:translations};window.addEventListener('message',e=>{if(e.source!==parent)return;if(e.data?.type==='sellingpilot-language')setLanguage(e.data.language,false);if(e.data?.type==='competitor-size')$('enlarge').textContent=e.data.expanded?'还原演示':'放大演示';});if(parent!==window)parent.postMessage({type:'sellingpilot-language-request'},'*');
function notify(message){const toast=document.querySelector('.toast');toast.textContent=t(message);toast.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.hidden=true,2200);}
function route(module){window.SellingPilotNavigation?.route(module);}document.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>route(b.dataset.route));
function toggleSidebar(){const collapsed=app.classList.toggle('sidebar-collapsed');for(const b of [$('sidebar-toggle'),$('sidebar-bottom')]){b.setAttribute('aria-expanded',String(!collapsed));b.dataset.originalLabel=collapsed?'Expand sidebar':'Collapse sidebar';b.setAttribute('aria-label',t(b.dataset.originalLabel));}closePopups();} $('sidebar-toggle').onclick=$('sidebar-bottom').onclick=toggleSidebar;$('insights-toggle').onclick=()=>{if(app.classList.contains('sidebar-collapsed'))toggleSidebar();else{const m=document.querySelector('.system-submenu');m.hidden=!m.hidden;$('insights-toggle').setAttribute('aria-expanded',String(!m.hidden));}};
function showHistory(on) {
  workspace.classList.toggle('history-hidden', !on);
  $('comparison-history').hidden = !on;
  $('history-show').hidden = on;
  for (const id of ['history-show', 'history-hide']) $(id).setAttribute('aria-expanded', String(on));
}
$('history-hide').onclick = () => {
  showHistory(false);
  $('history-show').focus();
};
$('history-show').onclick = () => {
  showHistory(true);
  $('history-hide').focus();
};
function renderHistory(){const query=$('history-search').value.trim().toLowerCase(),rows=histories.filter(h=>h.title.toLowerCase().includes(query)),pages=Math.max(1,Math.ceil(rows.length/7));historyPage=Math.min(historyPage,pages);$('history-list').replaceChildren();rows.slice((historyPage-1)*7,historyPage*7).forEach(h=>{const b=document.createElement('button');b.type='button';b.className='history-card'+(h.id===activeHistory?' active':'');b.setAttribute('aria-pressed',String(h.id===activeHistory));const productIds=filledIds(h.ids);const mainPhoto=h.sample?'source-3.png':catalog[productIds[0]].photo;b.innerHTML='<div class="history-card-main"><span class="history-main-photo"><img src="'+asset(mainPhoto)+'" alt=""></span><p class="history-card-title" title="'+escape(h.title)+'"><img src="'+asset('history-amazon.svg')+'" alt="Amazon">'+escape(h.title)+'</p><img class="history-vs" src="'+asset('history-vs.svg')+'" alt="VS"><div class="history-miniatures">'+productIds.slice(1).map(id=>'<span class="history-miniature"><img class="history-mini-channel" src="'+asset('history-amazon.svg')+'" alt="Amazon"><img class="history-mini-photo" alt="" src="'+asset(h.sample?'source-4.jpg':catalog[id].photo)+'"></span>').join('')+'</div></div><time>'+h.date+'</time>';b.onclick=()=>{analysisToken++;busy=false;selected=comparisonSlots(h.ids);activeHistory=h.id;reportReady=h.report;renderProducts();renderReport();document.querySelector('.comparison-panel').scrollTop=0;renderHistory();$('history-list').querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});};$('history-list').append(b);});if(!rows.length)$('history-list').innerHTML='<div class="comparison-empty-state history-empty-state"><img src="'+asset('empty-history.svg')+'" alt=""><span>'+t('No Data')+'</span></div>';$('history-page').textContent=historyPage+' / '+pages;$('history-prev').disabled=historyPage<=1;$('history-next').disabled=historyPage>=pages;}

$('history-search').oninput=()=>{historyPage=1;renderHistory();$('history-scroll').scrollTop=0;};$('history-prev').onclick=()=>{historyPage--;renderHistory();$('history-scroll').scrollTop=0;};$('history-next').onclick=()=>{historyPage++;renderHistory();$('history-scroll').scrollTop=0;};
const comparisonSlotCount = 4;
const filledIds = slots => slots.filter(id => id != null);
const comparisonSlots = ids => Array.from({length: comparisonSlotCount}, (_, index) => ids[index] ?? null);

function renderProducts() {
  const root = $('products-table');
  const table = document.createElement('table');
  const count = filledIds(selected).length;
  table.className = 'product-table';
  table.classList.toggle('all-slots-empty', count === 0);

  const cards = selected.map((id, index) => {
    const product = catalog[id];
    const separator = index === 0 ? '' : '<span class="product-vs" aria-hidden="true">VS</span>';
    const content = product
      ? (index === 0 ? '<span class="my-item">' + t('My Item') + '</span>' : '') +
        '<button type="button" class="remove-product" data-remove="' + index + '" aria-label="' +
        zh('Remove product', '移除商品') + ' ' + escape(product.title) + '">×</button>' +
        '<img src="' + asset(product.photo) + '" alt="">' +
        '<div class="product-card-label">' + channelIcon(product.channel) +
        '<p class="product-card-name" title="' + escape(product.title) + '">' +
        escape(product.id < 4 ? 'Creativity for Kids Mini Mini Garden Dinosaur: Kit ...' : product.title) +
        ' <span aria-hidden="true">›</span></p></div><strong class="product-card-price">$' +
        product.price.toFixed(2) + '</strong>'
      : '<div class="empty-slot-art"><img src="' + asset('empty-slot.svg') + '" alt="">' +
        '<p>' + zh('You can compare up<br>to 4 products at a time.', '一次最多可对比 4 件商品。') + '</p></div>';
    return '<td' + (index === 0 ? ' class="own-product"' : '') + '><div class="product-card">' +
      separator + content + '</div></td>';
  });

  const details = [
    ['Brand', product => escape(product.brand)],
    ['ASIN', product => escape(product.asin)],
    ['Ratings', product => '<span class="stars">★★★★<span style="color:#c9cfdd">★</span><small>' +
      product.rating.toFixed(1) + '</small></span>']
  ];
  table.innerHTML = '<tbody><tr><th scope="row">' + t('Product') + '</th>' + cards.join('') +
    '</tr>' + details.map(([label, format]) => '<tr><th scope="row">' + t(label) + '</th>' +
    selected.map(id => '<td>' + (id == null ? '' : format(catalog[id])) + '</td>').join('') +
    '</tr>').join('') + '</tbody>';
  root.replaceChildren(table);

  table.querySelectorAll('[data-remove]').forEach(button => {
    button.onclick = () => {
      if (busy) return;
      selected[Number(button.dataset.remove)] = null;
      reportReady = false;
      renderProducts();
      renderReport();
    };
  });

  $('compare').disabled = count < 2 || busy;
  $('comparison-status').textContent = busy ? zh('Analyzing selected products…', '正在分析所选商品…') : '';
}
const improvements=[['Product quality','Review recurring durability complaints and prioritize stronger materials.','Fewer defects and more positive reviews.','产品品质','汇总耐用性相关反馈，优先改进关键部件与材料。','减少故障，提升好评。'],['Usability','Simplify setup and include a clear illustrated quick-start guide.','A smoother first-use experience.','使用体验','简化初次使用步骤，提供清晰的图文说明。','降低使用门槛，改善首次体验。'],['Pricing strategy','Test a differentiated bundle at a competitive price point.','Improve perceived value and conversion.','定价策略','测试具有差异化价值的组合装和价格区间。','提升价值感与转化率。'],['Product presentation','Add accurate detail images and highlight differentiating features.','Set clear expectations and reduce returns.','商品展示','补充准确的细节图片，突出差异化功能。','建立合理预期，减少退货。'],['Customer support','Address common questions proactively and close the feedback loop.','Increase trust and repeat purchases.','客户服务','主动解答常见问题，形成用户反馈闭环。','增强信任，提升复购。'],['Market opportunities','Explore adjacent use cases and seasonal product variations.','Reach new customer segments.','市场机会','探索相邻使用场景与季节性产品变体。','触达新的客户群体。']];
function reportHTML(){const products=filledIds(selected).map(id=>catalog[id]),[primary,...others]=products;if(!primary)return '';return '<h2>'+t('Comparative Analysis and Recommendations')+'</h2><h3>'+t('Overview')+'</h3><p>'+zh('This analysis compares ','本次分析对比 ')+escape(primary.title)+zh(' with ',' 与 ')+others.map(p=>escape(p.brand+' ('+p.asin+')')).join('、')+zh('. Review pricing, ratings, product positioning, and potential improvement opportunities.','，从价格、评分、产品定位与改进机会等维度形成对比建议。')+'</p><h3>'+t('Key Strengths and Weaknesses')+'</h3>'+products.map((p,i)=>{return '<section><h4>'+escape(p.brand+' ('+p.asin+')')+'</h4><h5>'+t('Strengths')+'</h5><ul><li><b>'+zh('Customer rating: ','用户评分：')+'</b>'+p.rating+'/5. '+zh('A strong starting point for customer trust.','具备良好的客户信任基础。')+'</li><li><b>'+zh('Value: ','性价比：')+'</b>'+zh('At $'+p.price.toFixed(2)+', the product offers an accessible price point.','当前价格为 $'+p.price.toFixed(2)+'，可结合功能组合强化价值表达。')+'</li><li><b>'+zh('Positioning: ','产品定位：')+'</b>'+zh(i===0?'Established reference product for the comparison.':'An alternative option for similar customer needs.',i===0?'作为本次对比的自有商品基准。':'为相近需求提供替代选择。')+'</li></ul><h5>'+t('Weaknesses')+'</h5><ul><li>'+zh('Similar product descriptions make differentiation difficult to communicate.','商品描述相似，差异化价值不够明确。')+'</li><li>'+zh('Review recurring concerns around durability, ease of use and product presentation.','需要进一步关注耐用性、易用性及展示细节的反馈。')+'</li></ul></section>';}).join('')+'<h3>'+t('Recommendations')+' · '+escape(primary.brand)+'</h3>'+improvements.map((v,i)=>'<section><h4>'+String(i+1)+'. '+escape(v[language==='en'?0:3])+'</h4><p><b>'+zh('Improvement: ','改进建议：')+'</b>'+v[language==='en'?1:4]+'</p><p><b>'+zh('Benefit: ','预期收益：')+'</b>'+v[language==='en'?2:5]+'</p></section>').join('')+'<h3>'+t('Conclusion')+'</h3><p>'+zh('Prioritize the changes that solve repeated customer problems, then validate their impact with customer feedback and conversion data. Balance product quality, value and a clear listing presentation.','优先解决用户反复反馈的问题，再通过客户反馈与转化数据验证改进效果。在产品品质、价格价值与清晰的商品展示之间建立平衡。')+'</p><h3>'+t('Summary Table')+'</h3><table><thead><tr><th>'+t('Improvement Area')+'</th><th>'+t('Specific Action')+'</th><th>'+t('Expected Benefit')+'</th></tr></thead><tbody>'+improvements.map(v=>'<tr><td>'+v[language==='en'?0:3]+'</td><td>'+v[language==='en'?1:4]+'</td><td>'+v[language==='en'?2:5]+'</td></tr>').join('')+'</tbody></table><p class="report-note">'+t('Demo analysis uses local sample data.')+'</p>';}
function renderReport(){const root=$('report-content');root.closest('.analysis-report').classList.toggle('has-report',reportReady&&!busy);document.querySelector('.report-toolbar').hidden=!reportReady&&!busy;$('download').disabled=!reportReady||busy;if(busy){root.innerHTML='<div class="thinking-box"><h3><span class="thinking-spinner"></span>'+zh('Preparing comparative analysis','正在生成竞品分析')+'</h3><p>'+zh('1. Checking product details and comparison dimensions','1. 整理商品信息与对比维度')+'</p><p>'+zh('2. Comparing prices, ratings and positioning','2. 对比价格、评分与定位')+'</p><p>'+zh('3. Summarizing opportunities and recommendations','3. 汇总优化机会与行动建议')+'</p></div>';return;}root.innerHTML=reportReady?reportHTML():'<div class="comparison-empty-state report-empty-state"><img src="'+asset('no-report.svg')+'" alt=""><span>'+zh('No Report','暂无报告')+'</span></div>';$('download').disabled=!reportReady;$('depth').disabled=filledIds(selected).length<2;}
function newComparison(ids){analysisToken++;busy=false;selected=comparisonSlots(ids);activeHistory=null;reportReady=false;$('product-search').value='';closePopups();renderProducts();renderReport();renderHistory();document.querySelector('.comparison-panel').scrollTop=0;}$('new-comparison').onclick=openComparisonDialog;
async function compare(){if(filledIds(selected).length<2){notify('Please select at least 2 products to compare.');return;}if(busy)return;if(used>=30){notify(zh('Daily analysis limit reached.','已达到今日分析次数上限。'));return;}busy=true;reportReady=false;const token=++analysisToken;renderProducts();renderReport();await new Promise(r=>setTimeout(r,1200));if(token!==analysisToken)return;busy=false;used=Math.min(30,used+1);reportReady=true;const now=new Date(),id=Date.now();histories.unshift({id,title:catalog[filledIds(selected)[0]].title,ids:[...selected],date:now.toLocaleString('sv-SE')+' CST',report:true});activeHistory=id;historyPage=1;translations();renderProducts();renderReport();renderHistory();}$('compare').onclick=compare;
Object.assign(dictionary, {
  'New Competitive Comparison': '新建竞品对比',
  'Close new comparison': '关闭新建竞品对比',
  'Product URLs': '商品链接',
  'Paste product URLs here, one per line or comma-separated.': '粘贴商品链接，每行一个或用逗号分隔。',
  'Supported: Amazon, Newegg, Walmart, eBay, TikTok': '支持 Amazon、Newegg、Walmart、eBay、TikTok',
  'Or add manually': '或手动添加',
  'Marketplace': '平台',
  'Product ID': '商品 ID',
  'Enter product ID': '输入商品 ID',
  'Add Product': '添加商品',
  'Confirm': '确认', 'Import Through URL': '通过链接导入', 'Add Manually': '手动添加',
  'Add': '添加', 'Delete': '删除', 'Action': '操作', 'Current Price': '当前价格',
  'Have a try:': '试试看：', 'Error sample': '错误示例',
  'Enter valid product URLs from the supported marketplaces.': '请输入受支持平台的有效商品链接。'
});

const comparisonHosts = {
  amazon: 'Amazon', newegg: 'Newegg', walmart: 'Walmart', ebay: 'eBay', tiktok: 'TikTok'
};
const pendingProducts = new Map();
const validProductId = id => /^[a-z0-9_-]+$/i.test(id);

function parseComparisonUrl(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const domain = url.hostname.match(/(?:^|\.)(amazon|newegg|walmart|ebay|tiktok)\.(?:com|ca|co\.uk|de|fr|it|es|com\.mx)$/i);
    if (!domain) return null;
    const channel = comparisonHosts[domain[1].toLowerCase()];
    const path = url.pathname.split('/').filter(Boolean);
    const amazonMarker = path.findIndex(part => part === 'dp' || part === 'product');
    const id = (channel === 'Amazon' && amazonMarker >= 0 ? path[amazonMarker + 1] : path.at(-1)) || '';
    if (!validProductId(id)) return null;
    return {channel, id};
  } catch {
    return null;
  }
}

const comparisonKey = ({channel, id}) => channel + ':' + id.toUpperCase();

let comparisonMode = 'url';
let comparisonInputError = '';
const checkedPreviewProducts = new Set();
const comparisonExamples = [
  {channel:'Amazon', id:'B089VLTR4H', url:'https://www.amazon.com/dp/B089VLTR4H'},
  {channel:'Amazon', id:'B08J63ST2W', url:'https://www.amazon.com/dp/B08J63ST2W'},
  {channel:'Walmart', id:'B00WGLUE30', url:'https://www.walmart.com/ip/B00WGLUE30'},
  {channel:'Amazon', id:'DEMO-GLUE-01', url:'https://www.amazon.com/dp/DEMO-GLUE-01'}
];

function getComparisonProduct({channel, id}) {
  const match = catalog.find(product => product.channel === channel &&
    [product.asin, product.sku].some(value => value.toUpperCase() === id.toUpperCase()));
  if (match) return match;
  const sample = catalog.find(product => product.channel === channel) || catalog[0];
  return {...sample, channel, asin:id, sku:id, title:channel + ' · ' + id};
}

function updatePreviewSelection() {
  const all = $('comparison-check-all');
  all.disabled = pendingProducts.size === 0;
  all.checked = !all.disabled && checkedPreviewProducts.size === pendingProducts.size;
  all.indeterminate = checkedPreviewProducts.size > 0 && !all.checked;
  $('comparison-delete').disabled = checkedPreviewProducts.size === 0;
}

function renderComparisonInput() {
  $('comparison-url-add').disabled = !$('comparison-urls').value.trim();
  $('comparison-add').disabled = !$('comparison-product-id').value.trim();
  $('comparison-next').disabled = pendingProducts.size === 0;
  $('comparison-input-error').hidden = !comparisonInputError;
  $('comparison-input-error').textContent = t(comparisonInputError);
  $('comparison-platform-icon').innerHTML = channelIcon($('comparison-platform').value);

  const list = $('comparison-pending');
  list.replaceChildren();
  for (const [key, product] of pendingProducts) {
    const item = getComparisonProduct(product);
    const row = document.createElement('tr');
    row.innerHTML = '<td><input type="checkbox"></td><td><div class="preview-product">' +
      '<img alt="" src="' + asset(item.photo) + '"><span>' + channelIcon(item.channel) +
      escape(item.title) + '</span></div></td><td>$' + item.price.toFixed(2) +
      '</td><td>' + escape(item.brand) + '</td><td>' + escape(item.asin) +
      '</td><td><span class="preview-stars" aria-hidden="true">★★★★<span>★</span></span> ' +
      item.rating.toFixed(1) + '</td><td><button type="button">' + t('Delete') + '</button></td>';
    const check = row.querySelector('input');
    check.setAttribute('aria-label', zh('Select ', '选择 ') + item.title);
    check.checked = checkedPreviewProducts.has(key);
    check.onchange = () => {
      if (check.checked) checkedPreviewProducts.add(key);
      else checkedPreviewProducts.delete(key);
      updatePreviewSelection();
    };
    row.querySelector('button').onclick = () => deletePreviewProducts([key]);
    list.append(row);
  }
  $('comparison-empty').hidden = pendingProducts.size > 0;
  $('comparison-empty-hint').textContent = comparisonMode === 'url'
    ? zh('Enter product URLs and click Add to preview products.', '输入商品链接并点击添加以预览商品。')
    : zh('Enter a product ID and click Add Product to preview it.', '输入商品 ID 并点击「添加商品」进行预览。');
  updatePreviewSelection();
}

function deletePreviewProducts(keys) {
  for (const key of keys) {
    pendingProducts.delete(key);
    checkedPreviewProducts.delete(key);
  }
  renderComparisonInput();
}

function addPreviewProducts(products) {
  const next = new Map(pendingProducts);
  for (const product of products) next.set(comparisonKey(product), product);
  comparisonInputError = next.size > comparisonSlotCount ? 'You can compare up to 4 products.' : '';
  if (!comparisonInputError) {
    for (const [key, product] of next) pendingProducts.set(key, product);
  }
  return !comparisonInputError;
}

function renderComparisonExamples() {
  const examples = $('comparison-examples');
  examples.textContent = t('Have a try:');
  for (const sample of [...comparisonExamples, null]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = sample ? sample.channel + ' · ' + sample.id : t('Error sample');
    button.onclick = () => {
      if (comparisonMode === 'url') {
        const input = $('comparison-urls');
        const value = sample?.url || 'https://example.invalid/product/demo';
        const lines = input.value.split(/[\n,，]+/).map(line => line.trim()).filter(Boolean);
        if (!lines.includes(value)) lines.push(value);
        input.value = lines.join('\n');
        input.focus();
      } else {
        if (sample) $('comparison-platform').value = sample.channel;
        $('comparison-product-id').value = sample?.id || 'bad id!';
        $('comparison-product-id').focus();
      }
      comparisonInputError = '';
      renderComparisonInput();
      if (!sample) $(comparisonMode === 'url' ? 'comparison-url-add' : 'comparison-add').click();
    };
    examples.append(button);
  }
}

function setComparisonMode(mode) {
  comparisonMode = mode;
  $('comparison-add').hidden = mode !== 'manual';
  comparisonInputError = '';
  for (const method of ['url', 'manual']) {
    const tab = $('comparison-' + method + '-tab');
    tab.setAttribute('aria-selected', String(method === mode));
    tab.tabIndex = method === mode ? 0 : -1;
    $('comparison-' + method + '-panel').hidden = method !== mode;
  }
  renderComparisonExamples();
  renderComparisonInput();
}

function openComparisonDialog() {
  pendingProducts.clear();
  checkedPreviewProducts.clear();
  $('new-comparison-form').reset();
  $('new-comparison-form').querySelector('.comparison-drawer-body').scrollTop = 0;
  closePopups();
  setComparisonMode('url');
  $('new-comparison-dialog').showModal();
}

for (const mode of ['url', 'manual']) {
  const tab = $('comparison-' + mode + '-tab');
  tab.onclick = () => setComparisonMode(mode);
  tab.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' || (event.key !== 'End' && mode === 'manual') ? 'url' : 'manual';
    setComparisonMode(next);
    $('comparison-' + next + '-tab').focus();
  };
}

$('comparison-cancel').onclick = $('new-comparison-close').onclick = () => $('new-comparison-dialog').close();
$('comparison-urls').oninput = $('comparison-product-id').oninput = $('comparison-platform').onchange = () => {
  comparisonInputError = '';
  renderComparisonInput();
};
$('comparison-clear').onclick = () => {
  $('comparison-urls').value = '';
  comparisonInputError = '';
  renderComparisonInput();
};
$('comparison-url-add').onclick = () => {
  const values = $('comparison-urls').value.split(/[\n,，]+/).map(value => value.trim()).filter(Boolean);
  const products = values.map(parseComparisonUrl);
  if (products.includes(null)) comparisonInputError = 'Enter valid product URLs from the supported marketplaces.';
  else if (addPreviewProducts(products)) $('comparison-urls').value = '';
  renderComparisonInput();
};
$('comparison-add').onclick = () => {
  const input = $('comparison-product-id');
  const id = input.value.trim();
  if (!validProductId(id)) {
    comparisonInputError = zh('Enter a valid product ID.', '请输入有效的商品 ID。');
  } else if (addPreviewProducts([{channel:$('comparison-platform').value, id}])) {
    input.value = '';
  }
  renderComparisonInput();
};
$('comparison-product-id').onkeydown = event => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  $('comparison-add').click();
};
$('comparison-check-all').onchange = event => {
  checkedPreviewProducts.clear();
  if (event.target.checked) {
    for (const key of pendingProducts.keys()) checkedPreviewProducts.add(key);
  }
  renderComparisonInput();
};
$('comparison-delete').onclick = () => deletePreviewProducts(checkedPreviewProducts);

$('new-comparison-form').onsubmit = event => {
  event.preventDefault();
  if (pendingProducts.size === 0) return;

  const ids = Array.from(pendingProducts.values(), product => {
    const item = getComparisonProduct(product);
    if (catalog[item.id] === item) return item.id;
    const id = catalog.length;
    catalog.push({...item, id});
    return id;
  });
  $('new-comparison-dialog').close();
  newComparison(ids);
};

function positionPopup(popup,anchor){const a=anchor.getBoundingClientRect(),r=app.getBoundingClientRect();popup.hidden=false;popup.style.left=Math.max(8,Math.min(a.left-r.left,app.clientWidth-popup.offsetWidth-8))+'px';popup.style.top=Math.min(a.bottom-r.top+8,app.clientHeight-popup.offsetHeight-8)+'px';}
function closePopups(){for(const id of ['channel-popup','search-results','analysis-history-popup'])$(id).hidden=true;$('channel-trigger').setAttribute('aria-expanded','false');$('analysis-history').setAttribute('aria-expanded','false');}
const selectedChannels = new Set();
const channelNames = ['Walmart', 'Amazon', 'eBay', 'TikTok', 'Newegg', 'Shopify'];
const channelCountries = [['US', 'United States'], ['CA', 'Canada']];
const channelLogoRoot = 'resource/imgs/component-library/Sellingpilot-Icon/Logo/';
const countryIcon = code => '<img alt="" src="' + channelLogoRoot + 'Country/' + (code === 'CA' ? 'CAN' : 'US') + '.svg">';
const channelIcon = name => '<img alt="" src="' + channelLogoRoot + 'logo/' + (name === 'TikTok' ? 'Tiktok' : name) + '.svg">';
const channelGroups = [];

for (const [code, countryName] of channelCountries) {
  const popup = $('channel-popup');
  const group = document.createElement('label');
  group.className = 'channel-row';
  group.innerHTML = '<input type="checkbox">' + countryIcon(code) + '<span data-t="' + countryName + '">' + countryName + '</span>';
  popup.append(group);
  const groupCheck = group.querySelector('input');
  const children = channelNames.map(name => {
    const key = code + ':' + name;
    const row = document.createElement('label');
    row.className = 'channel-row channel-child' + (name === 'Amazon' ? ' channel-amazon' : '');
    row.innerHTML = '<input type="checkbox">' + channelIcon(name) + '<span>' + name + '</span>';
    const input = row.querySelector('input');
    input.disabled = code === 'CA' && !['Amazon', 'Newegg'].includes(name);
    input.onchange = () => {
      if (input.checked) selectedChannels.add(key);
      else selectedChannels.delete(key);
      renderChannels();
    };
    popup.append(row);
    return {key, input};
  });
  groupCheck.onchange = () => {
    for (const {key, input} of children) {
      if (input.disabled) continue;
      if (groupCheck.checked) selectedChannels.add(key);
      else selectedChannels.delete(key);
    }
    renderChannels();
  };
  channelGroups.push({groupCheck, children});
}

function renderChannels() {
  for (const {groupCheck, children} of channelGroups) {
    const available = children.filter(({input}) => !input.disabled);
    for (const {key, input} of children) input.checked = selectedChannels.has(key);
    const count = available.filter(({input}) => input.checked).length;
    groupCheck.checked = count === available.length;
    groupCheck.indeterminate = count > 0 && count < available.length;
  }

  const summary = $('channel-selection');
  summary.replaceChildren();
  if (!selectedChannels.size) {
    summary.textContent = zh('Country | Channels', '国家/地区 | 渠道');
    return;
  }

  const key = selectedChannels.values().next().value;
  const [code, name] = key.split(':');
  const pill = document.createElement('span');
  pill.className = 'channel-pill';
  pill.innerHTML = countryIcon(code) + channelIcon(name) + '<span>' + name + '</span>';
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'channel-remove';
  remove.setAttribute('aria-label', zh('Remove ', '移除 ') + name);
  remove.textContent = '×';
  remove.onclick = event => {
    event.stopPropagation();
    selectedChannels.delete(key);
    renderChannels();
    $('channel-trigger').focus({preventScroll:true});
  };
  pill.append(remove);
  summary.append(pill);
  if (selectedChannels.size > 1) {
    const count = document.createElement('span');
    count.className = 'channel-count';
    count.textContent = '+' + (selectedChannels.size - 1);
    summary.append(count);
  }
}

$('channel-select').onclick = () => {
  const popup = $('channel-popup');
  const open = popup.hidden;
  closePopups();
  if (open) {
    positionPopup(popup, $('channel-select'));
    $('channel-trigger').setAttribute('aria-expanded', 'true');
  }
};
function search(){const query=$('product-search').value.trim().toLowerCase();const matches=catalog.filter(p=>(!selectedChannels.size || selectedChannels.has((p.country || 'US') + ':' + p.channel)) && (p.title+' '+p.brand+' '+p.asin+' '+p.sku).toLowerCase().includes(query));const results=$('search-results');results.innerHTML=matches.length?matches.map(p=>'<button class="search-result" data-add="'+p.id+'"><img src="'+asset(p.photo)+'" alt=""><span>'+escape(p.title)+'<br><small>'+p.asin+' · '+p.channel+'</small></span><b>'+(selected.includes(p.id)?'✓':'＋')+'</b></button>').join(''):'<p>'+t('No matching products. Try an ASIN, SKU, or another keyword.')+'</p>';results.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{if(selected.includes(+b.dataset.add)){closePopups();return;}const slot=selected.indexOf(null);if(slot===-1){notify('You can compare up to 4 products.');return;}if(busy)return;selected[slot]=+b.dataset.add;reportReady=false;renderProducts();renderReport();closePopups();});closePopups();positionPopup(results,$('product-search'));}$('search').onclick=search;$('product-search').onkeydown=e=>{if(e.key==='Enter')search();};
function showChat(on){if(on&&workspace.classList.contains('chat-open')){$('chat-input').focus();return;}if(on){if(filledIds(selected).length<2){notify('Select products before opening depth analysis.');return;}historyWasOpen=!workspace.classList.contains('history-hidden');showHistory(false);}else showHistory(historyWasOpen);workspace.classList.toggle('chat-open',on);document.querySelector('.chat-panel').hidden=!on;if(on){renderChat();$('chat-input').focus();}}
$('depth').onclick=()=>showChat(true);$('chat-close').onclick=()=>showChat(false);
const prompts=['How can we improve our product based on the analysis?','What are the main strengths and weaknesses of our product?','What market opportunities should we focus on?'];
const chatAvatar = '<img class="chat-avatar" src="resource/imgs/sellingpilot/navigation/assistant-default.gif" alt="">';
let chatStartedAt = new Date();

function renderChat() {
  const root = $('chat-messages');
  const time = new Intl.DateTimeFormat(language, {hour:'numeric', minute:'2-digit'}).format(chatStartedAt);
  const welcome = zh(
    'Hello! I can help you explore your product comparison report. What would you like to improve?',
    '你好！我可以帮你进一步理解竞品分析报告。你希望优先优化哪些方面？'
  );
  const suggestions = prompts.map((question, index) =>
    '<button type="button" data-question="' + index + '">' + t(question) + ' <span aria-hidden="true">›</span></button>'
  ).join('');
  const conversation = messages.map(message => {
    if (message.user) {
      return '<div class="chat-message chat-message-user"><div class="chat-bubble user">' +
        escape(message.text) + '</div><span class="chat-self" aria-label="' + zh('You', '你') + '">' +
        zh('ME', '我') + '</span></div>';
    }
    return '<div class="chat-message chat-message-assistant">' + chatAvatar + '<div class="chat-reply">' +
      '<details class="chat-reasoning"><summary>' + zh('Thinking process (DeepSeek-R1)', '思考过程（DeepSeek-R1）') +
      '</summary><p>' + zh(
        'The response considers the selected products, displayed pricing and ratings, and the sample report’s improvement areas.',
        '回答基于已选商品、展示的价格评分，以及示例报告中的优化方向。'
      ) + '</p></details><div class="chat-bubble">' + escape(zh(message.en, message.cn)) + '</div></div></div>';
  }).join('');
  root.innerHTML = '<time class="chat-start-time">' + time + '</time><div class="chat-welcome">' +
    chatAvatar + '<div class="chat-bubble">' + welcome + '</div></div>' +
    '<div class="chat-suggestions">' + suggestions + '</div>' + conversation +
    (thinkingChat ? '<div class="chat-message chat-message-assistant">' + chatAvatar +
      '<div class="chat-bubble"><span class="thinking-spinner"></span>' +
      zh('Preparing a response…', '正在整理回答…') + '</div></div>' : '');
  root.querySelectorAll('[data-question]').forEach(button => {
    button.onclick = () => sendQuestion(t(prompts[Number(button.dataset.question)]));
  });
  if (messages.length) root.scrollTop = root.scrollHeight;
}
function makeAnswer(question){const pricing=/price|pricing|定价|价格/i.test(question),market=/market|机会|市场/i.test(question);if(pricing)return {en:'Compare your total offer with alternatives rather than competing on price alone. Test a differentiated bundle, explain its value clearly, and monitor conversion and review feedback. Keep a minimum margin target before testing discounts.',cn:'不要只比较标价，要比较用户获得的整体价值。可以测试差异化组合装，清楚呈现其优势，并观察转化与评价反馈。促销测试前先设定最低利润目标。'};if(market)return {en:'Focus on adjacent use cases and underserved customer needs. Improve product details for common questions, test seasonal or bundle variations, and validate demand with a small product experiment before expanding.',cn:'关注相邻使用场景和未被充分满足的需求。根据常见问题完善商品信息，测试季节款或组合装，先用小规模实验验证需求，再逐步扩展。'};return {en:'Start with repeated customer concerns: product durability, ease of use, and how accurately your images communicate the offer. Prioritize one improvement, update the listing to explain it, and measure customer feedback and conversion before making the next change.',cn:'先从用户反复提到的问题入手：产品耐用性、易用性，以及图片是否准确表达商品价值。优先完成一项改进，在商品页清晰说明，并通过客户反馈与转化数据验证，再安排下一步优化。'};}
async function sendQuestion(q){q=q.trim();if(!q||thinkingChat)return;const version=chatVersion;messages.push({user:true,text:q});const entry = {text:q,date:new Date()};questions.unshift(entry);activeQuestion=entry;thinkingChat=true;$('chat-input').value='';$('chat-count').textContent='0/2000';renderChat();await new Promise(r=>setTimeout(r,850));if(version!==chatVersion)return;messages.push({...makeAnswer(q),user:false});thinkingChat=false;renderChat();}
$('chat-form').onsubmit=e=>{e.preventDefault();sendQuestion($('chat-input').value);};$('chat-input').oninput=()=>$('chat-count').textContent=$('chat-input').value.length+'/2000';$('chat-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendQuestion(e.target.value);}};$('chat-clear').onclick=()=>{$('chat-input').value='';$('chat-count').textContent='0/2000';};$('new-chat').onclick=()=>{chatVersion++;chatStartedAt=new Date();messages=[];thinkingChat=false;$('chat-input').value='';$('chat-count').textContent='0/2000';renderChat();$('chat-input').focus();};
const analysisHistoryButton = $('analysis-history');
const analysisHistoryPopup = $('analysis-history-popup');
analysisHistoryButton.setAttribute('aria-haspopup', 'dialog');
analysisHistoryButton.setAttribute('aria-controls', analysisHistoryPopup.id);
analysisHistoryButton.setAttribute('aria-expanded', 'false');
analysisHistoryPopup.removeAttribute('aria-label');
analysisHistoryPopup.setAttribute('aria-labelledby', 'analysis-history-title');
analysisHistoryPopup.tabIndex = -1;
const historyDateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});

function renderAnalysisHistory() {
  analysisHistoryPopup.innerHTML = '<h3 id="analysis-history-title">' +
    t('In depth analysis of history') + '</h3>';
  if (!questions.length) {
    const empty = document.createElement('div');
    empty.className = 'analysis-history-empty';
    empty.innerHTML = '<img src="' + asset('analysis-history-empty.svg') +
      '" alt=""><span>' + t('No Data') + '</span>';
    analysisHistoryPopup.append(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'analysis-history-rows';
  for (const question of questions) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'analysis-history-row';
    row.setAttribute('aria-pressed', String(question === activeQuestion));
    const text = document.createElement('span');
    text.textContent = text.title = question.text;
    const time = document.createElement('time');
    time.dateTime = question.date.toISOString();
    const parts = Object.fromEntries(historyDateFormat.formatToParts(question.date).map(part => [part.type, part.value]));
    time.textContent = parts.month + '-' + parts.day + ' ' +
      parts.hour + ':' + parts.minute + ':' + parts.second + ' CST';
    row.append(text, time);
    row.onclick = () => {
      activeQuestion = question;
      closePopups();
      fullscreen = false;
      workspace.classList.remove('report-expanded');
      showChat(true);
      $('chat-input').value = question.text;
      $('chat-count').textContent = question.text.length + '/2000';
    };
    list.append(row);
  }
  analysisHistoryPopup.append(list);
}

analysisHistoryButton.onclick = () => {
  const open = analysisHistoryPopup.hidden;
  closePopups();
  if (!open) return;
  renderAnalysisHistory();
  analysisHistoryPopup.hidden = false;
  const clock = analysisHistoryButton.getBoundingClientRect();
  const board = app.getBoundingClientRect();
  const offset = board.width / 1920;
  analysisHistoryPopup.style.left = Math.max(8, Math.min(clock.left - board.left - 12 * offset,
    app.clientWidth - analysisHistoryPopup.offsetWidth - 8)) + 'px';
  analysisHistoryPopup.style.top = Math.max(8, Math.min(clock.bottom - board.top + 8 * offset,
    app.clientHeight - analysisHistoryPopup.offsetHeight - 8)) + 'px';
  analysisHistoryButton.setAttribute('aria-expanded', 'true');
  (analysisHistoryPopup.querySelector('[aria-pressed="true"]') || analysisHistoryPopup).focus({preventScroll:true});
};
window.addEventListener('sellingpilot-language-changed', () => {
  if (!analysisHistoryPopup.hidden) renderAnalysisHistory();
});
$('download').onclick=()=>{if(!reportReady)return;const blob=new Blob([$('report-content').innerText],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SellingPilot-Competitor-Comparison.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);notify('Report downloaded');};$('report-fullscreen').onclick=()=>{fullscreen=!fullscreen;workspace.classList.toggle('report-expanded',fullscreen);closePopups();};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#channel-popup,#channel-select,#search-results,#search,#product-search,#analysis-history-popup,#analysis-history'))closePopups();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('new-comparison-dialog').open)return;const hasPopup=['channel-popup','search-results','analysis-history-popup'].some(id=>!$(id).hidden);const hasAnalysisHistory=!analysisHistoryPopup.hidden;closePopups();if(hasAnalysisHistory)analysisHistoryButton.focus({preventScroll:true});if(hasPopup)return;if(fullscreen){fullscreen=false;workspace.classList.remove('report-expanded');}else if(workspace.classList.contains('chat-open'))showChat(false);else if(parent!==window)parent.postMessage({type:'competitor-restore'},'*');}});window.addEventListener('resize',closePopups);$('enlarge').onclick=()=>{if(parent!==window)parent.postMessage({type:'competitor-enlarge'},'*');else{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{});}};refresh();
})();
