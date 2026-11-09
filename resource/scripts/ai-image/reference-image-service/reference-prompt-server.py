from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
from PIL import Image
import io,json,subprocess,tempfile,re,logging
ROOT=Path(__file__).resolve().parent
PYTHON_LABELS={'jacket':'夹克','clothing':'服装','jeans':'牛仔服饰','shirt':'衬衫','coat':'外套','people':'人物','person':'人物','adult':'成年人','man':'男性人物','woman':'女性人物','hat':'帽子','coffee':'咖啡','cup':'杯子','mug':'马克杯','kitchen':'厨房','interior_room':'室内空间','living_room':'客厅','furniture':'家具','table':'桌子','chair':'椅子','sofa':'沙发','plant':'植物','flower':'花卉','tree':'树木','city':'城市','building':'建筑','beach':'海滩','sea':'海洋','landscape':'自然风景','dog':'狗','cat':'猫','food':'食物','bottle':'瓶装产品','computer':'电脑','screen':'屏幕','web_site':'网页界面','website':'网页界面','text':'文字','screenshot':'软件界面','mobile_phone':'手机','shoe':'鞋子','car':'汽车','vehicle':'车辆','mountain':'山脉','sky':'天空','water':'水景','book':'书籍','bag':'包袋','handbag':'手提包','backpack':'背包','watch':'手表','jewelry':'珠宝','perfume':'香水','cosmetics':'化妆品','product':'商品','diagram':'图表'}
def prompt_for(im,analysis,lang):
 zh=lang!='en';words=' '.join(analysis['text']);lower=words.lower();labels=[x['label'] for x in analysis['labels'] if x['confidence']>=.17][:4]
 if not labels and analysis['labels'] and analysis['labels'][0]['confidence']>=.08:labels=[analysis['labels'][0]['label']]
 if 'jacket' in labels and 'clothing' in labels:labels.remove('clothing')
 ui_patterns=[('navigation|home|menu|management|首页|菜单','navigation and sidebar menus','顶部导航与侧边菜单'),('product|sku|商品|产品','product information and list sections','商品信息与列表区域'),('customer service|message|客服|消息','customer service conversations','客服消息与会话区域'),('assistant|助手','an AI assistant panel','AI 助手面板'),('sales|revenue|dashboard|销售|看板','sales metrics and charts','销售指标与图表'),('order|订单','order management information','订单管理信息')]
 ui=any(x in lower for x in ['sellingpilot','dashboard','customer service','management','ai assistant']) and len(analysis['text'])>4
 if ui:
  elements=[(c if zh else e) for p,e,c in ui_patterns if re.search(p,lower)]
  features=('、' if zh else ', ').join(elements) or ('清晰的信息分区' if zh else 'clearly organized content sections')
  return ('设计一张现代电商管理系统界面，包含'+features+'。沿用参考图的信息层级和区域布局，以白色与浅灰色为主背景，蓝色强调关键操作，卡片分区清晰，文字易读，适合业务系统的高保真界面展示。') if zh else ('Create a modern ecommerce management interface featuring '+features+'. Preserve the reference image’s information hierarchy and panel arrangement, with clean white and light neutral surfaces, blue accents for primary actions, clearly separated sections and readable typography. High-fidelity business software UI design.')
 palette=im.convert('RGB').resize((64,64)).quantize(colors=5).convert('RGB');colors=sorted(palette.getcolors(4096),reverse=True)
 def color(rgb):
  r,g,b=rgb
  if max(rgb)-min(rgb)<25:return ('白色','white') if sum(rgb)>630 else ('灰色','gray') if sum(rgb)>180 else ('黑色','black')
  if b>r*1.15 and b>g*1.05:return '蓝色','blue'
  if g>r*1.12 and g>b*1.08:return '绿色','green'
  if r>b*1.3 and g>b*1.15:return ('棕色','brown') if r<180 else ('暖黄色','warm yellow')
  if r>g*1.2:return '红色','red'
  return '中性色','neutral'
 tones=list(dict.fromkeys(color(rgb)[0 if zh else 1] for _,rgb in colors))[:3]
 subjects=[PYTHON_LABELS.get(x,x.replace('_',' ')) if zh else x.replace('_',' ') for x in labels]
 subject=('、' if zh else ', ').join(subjects) or ('参考图中的主体与场景' if zh else 'the subject and setting shown in the reference image')
 ratio=('横向构图' if im.width>im.height*1.15 else '纵向构图' if im.height>im.width*1.15 else '方形构图') if zh else ('landscape composition' if im.width>im.height*1.15 else 'portrait composition' if im.height>im.width*1.15 else 'square composition')
 if zh:return '以'+subject+'为核心元素，采用'+ratio+'，主色调为'+'、'.join(tones)+'。保留参考图的主体关系与画面层次，突出材质细节，光影自然，构图平衡，生成清晰、精致、适合电商视觉展示的图片。'
 return 'Create an image featuring '+subject+', with a '+ratio+' and a palette of '+', '.join(tones)+'. Preserve the reference image’s main elements and spatial relationships. Emphasize material details, natural-looking lighting and a balanced layout. Produce a clear, polished image suitable for ecommerce visual content.'
class Handler(BaseHTTPRequestHandler):
 def send_headers(self,code):
  self.send_response(code);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Access-Control-Allow-Origin','*');self.send_header('Access-Control-Allow-Methods','POST,GET,OPTIONS');self.send_header('Access-Control-Allow-Headers','Content-Type,X-SP-Language');self.send_header('Access-Control-Allow-Private-Network','true');self.send_header('Cache-Control','no-store');self.end_headers()
 def send(self,code,data):self.send_headers(code);self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
 def do_OPTIONS(self):self.send_headers(204)
 def do_GET(self):self.send(200,{'status':'ready','service':'SellingPilot local reference image analysis'}) if self.path=='/health' else self.send(404,{'error':'Not found'})
 def do_POST(self):
  if self.path!='/extract-prompt':return self.send(404,{'error':'Not found'})
  try:
   n=int(self.headers.get('Content-Length','0'))
   if not 0<n<=5*1024*1024:return self.send(413,{'error':'Image must be within 5MB.'})
   image=Image.open(io.BytesIO(self.rfile.read(n)));image.load()
   if image.format not in ['PNG','JPEG','WEBP'] or not(64<=image.width<=3072 and 64<=image.height<=3072):return self.send(422,{'error':'Unsupported image format or dimensions.'})
   with tempfile.TemporaryDirectory(prefix='sellingpilot-reference-') as folder:
    p=Path(folder)/'reference.png';image.convert('RGB').save(p)
    run=subprocess.run(['/usr/bin/osascript','-l','JavaScript',str(ROOT/'reference-image-analysis.js'),str(p)],capture_output=True,text=True,timeout=45)
    if run.returncode:raise RuntimeError('Local image analysis unavailable')
    analysis=json.loads(run.stdout)
   lang=self.headers.get('X-SP-Language','en');self.send(200,{'prompt':prompt_for(image,analysis,lang)[:1000],'elements':analysis['labels'][:5],'method':'local-image-classification-and-text-recognition'})
  except Exception as e:
   logging.error('Reference image analysis failed: %s',type(e).__name__);self.send(503,{'error':'Unable to analyze this image. Please try again.'})
 def log_message(self,*args):pass
if __name__=='__main__':
 logging.basicConfig(level=logging.INFO);print('SellingPilot local reference image analysis ready at http://127.0.0.1:8766',flush=True);ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
