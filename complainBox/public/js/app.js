if('serviceWorker' in navigator)
{
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register('./sw.js').then(res =>{
            console.log('service worker is register do inspect it' , res)
        })
        .catch( err =>{
            console.log(`${err} occured`)
        })

    })
   
}