//now to make available our app offline we will work on pre caching assets
const myCache = 'cache1'
const dynamicCache = 'dynamicCache1'
const assets = [
    '/',
    '/main.html',
    '/js/app.js',
    '/js/index.js',
    '/app.css',
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.5/xlsx.full.min.js",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
    "https://code.jquery.com/jquery-3.3.1.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"
    //fallback page has to be added here too
]

//to install the service worker
self.addEventListener('install',event =>{
    //console.log('service worker installed ',event)
    //waitUntil function will make the install the event to wait untill the cache promise is fulfilled
    event.waitUntil(
    caches.open(myCache).then(cache =>{
        cache.addAll(assets)
    })
    )
})

//to activate the service worker
self.addEventListener('acitvate',event => {
    console.log('service worker activated')
    //inorder to delete the old cache bcz if it is not deleted it wont load the updated files
    event.waitUntil(
    
        //caches.keys() gives the array of caches
        caches.keys().then(keys =>{
            console.log(keys)
            return Promise.all(keys
                .filter(key => key !== myCache && key !== dyanamicCache)
                .map(key => caches.delete(key)))
        }) //caches.delete() returns a promise
    )
})

//to fetch the event
self.addEventListener('fetch', event=>{
   //console.log('fetched',event)
   //if we do not want to cache out the firestore req 
   if(event.request.url.indexOf('firestore.googleapis.com') === -1){
   //stopping the browser to access server and making req to cache and get the response
   event.respondWith(
       caches.match(event.request).then( response =>{
        return response || fetch(event.request).then(res=>{
 
            return caches.open(dynamicCache).then(cache =>{
                cache.put(event.request.url,res.clone())
                cacheSize(dynamicCache,10)
                return res
            })

        })
       }
           
       ).catch(()=> caches.match('/')) //here any fallback page which is not present in cache
   )
    } 
})

//to limit the size of cache 
const cacheSize = (name,size)=>{
    caches.open(name).then(cache =>{
        cache.keys().then(keys =>{
            if(keys.length > size)
            {   
                caches.delete(keys[0]).then(cacheSize(name,size))
            }
        })
    })
}