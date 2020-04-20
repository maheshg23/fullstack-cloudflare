
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {
  
  const URL= "https://cfw-takehome.developers.workers.dev/api/variants";
  const response = await fetch(URL);
  const jsonData = await response.json();
  var urlarr = jsonData.variants;
  // console.log("Hello Worker 111 " + urlarr);

  if(request.headers.get('Cookie')){
    const cookie = parseCookie(request.headers.get('Cookie'));
    console.log("Cookie - " + cookie['user-cloudflare']);
    console.log("Cookies "+request.headers.get('Cookie'))
    assignment = cookie['user-cloudflare']
  }else{
    assignment = "";
  }

  try {
    var responseNew = "";
    var a = "";
    if (assignment) {
      var i = parseInt(assignment)
      a = i-1;
      var url = urlarr[a];
      console.log("url " + url)
      responseNew = await fetch(url);
    }
    else{
      a = Math.floor(Math.random() * Math.floor(2));
      var userURL = urlarr[a];
      console.log("Random URL - "+userURL);
      responseNew = await fetch(userURL);
    }
    
    let modifiedResponse = new HTMLRewriter()
    .on('title', {
      element(element) {
        a=a+1;
        element.replace('<title>Modified Variant '+a+ '</title>',{html:true});
      },
    })
    .on('h1#title', {
      element(element) {
        element.replace('\nModified Variant '+a,{html:true});
      },
    })
    .on('p#description', {
      element(element) {
        let num = (a ==1 ? 'one' : 'two');
        element.replace('\nModified - This is variant '+num+' of My Project!',{html:true});
      },
    })
    .on('a#url', {
      element(element) {
        element.setAttribute('href',"https://wp.nyu.edu/mahesh/");
        element.setInnerContent('Return to My Website',{html:true});
      },
    })
    .transform(responseNew);

    const htmlData = await modifiedResponse.text();
    
    if(assignment){
      var output = new Response(htmlData, {
        headers: { 'content-type': 'text/html',
      },
      })
    }else{
      var output = new Response(htmlData, {
        headers: { 'content-type': 'text/html',
        'Set-Cookie': 'user-cloudflare=' + a,
      },
      })
    }
    return output;
    
  } catch(e){
    throw Error(e);
  }
}

function parseCookie(val) {
  // Split into key-value pairs
  if(val == null) return null;
  const kvs = val.split(';').filter(v => v !== '' )
  
  // Fold the pairs into a simple object
  return kvs.reduce((cookie, kv) => {
    kv = kv.trim()
    const [k, v] = kv.split('=')
    cookie[k] = v
    return cookie
  }, {})
}
