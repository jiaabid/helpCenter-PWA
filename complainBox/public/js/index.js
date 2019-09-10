const freader = new FileReader()
const add_user = document.getElementById('add_user')
add_user.addEventListener('change',function(e){
   const file = e.target
   console.log(file)
   freader.readAsArrayBuffer(file.files[0])
   freader.onload = function(){
       console.log(freader.result)
       const data =new Uint8Array(freader.result)
       const workbook = XLSX.read(data,{type:"array"})
       XLSX.write(workbook,{
           sheet:'Sheet1',
           type: 'binary',
           bookType:'html'
       })
       const wb_json = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'])
       console.log(wb_json)
       for(i of wb_json)
       {
           const user_id = i.user_id
           const contact = i.contact
           const payment = i.payment
           const obj = {user_id , contact,payment}
           db.collection('users').doc(user_id).set(obj)
           .then(()=>{
               console.log("done")
           })
           .catch(err =>
           {
               alert(`can proceed due to ${err}`)
           })
       }
   }
})
//getting data offline
db.enablePersistence()
.catch(err=>{
    if(err.code === 'failed-precondition'){
        console.log('persistance failed')
    }
    else if(err.code == 'unimplemented'){
        console.log('persistance is unavailable')
    }
})
//GETTING COMPLAINSV
const submit = document.getElementById('complain')
submit.addEventListener('submit',(e)=>{
    e.preventDefault()
    if(submit.u_id.value !== "" || submit.complain.value !== "" )
    {
        db.collection('complain').add({
            userid : submit.u_id.value,
            complain : submit.complain.value
        }).then(res =>{
            console.log('added')
            const ele = document.querySelector('#c_box')
            M.Modal.getInstance(ele).close()
            submit.u_id.value = ""
            submit.complain.value = ""
        })
    }      
})    
//to retrieve data
db.collection('complain').onSnapshot(shot =>{
 
   const docs = shot.docChanges()
   console.log(docs)
    docs.forEach(obj =>{
        console.log(obj.doc.data())
        if(obj.type === 'added')
        {
            const ele = display(obj)
        }
        else if(obj.type === 'removed')
        {
            //remove(obj)
        }
    })
})

//setting data on userinterface
function display(obj)
{
    const maindiv = document.getElementById('complains')
    const li = document.createElement('li')
    const username = document.createElement('span')
    const complain = document.createElement('span')
    const button = document.createElement('button')
    
    li.setAttribute('data-id', `${obj.doc.id}`)
    li.setAttribute('class','list')
    button.setAttribute('class','btn-small right black resolve')
    username.setAttribute('id','uname')
    
    
    username.innerHTML = `<b>${obj.doc.data().userid}:</b> `
    complain.innerHTML = `${obj.doc.data().complain}`
    button.innerHTML = 'Resolved'
    
    li.appendChild(username)
    li.appendChild(complain)
    li.appendChild(button)
    button.addEventListener('click',remove,false)
    
    username.addEventListener('click',(e)=>{
       const id = e.target.textContent.replace(":","")
       console.log(id)
     db.collection('users').doc(id).get()
     .then(doc =>{
         console.log(doc)
         if(doc.exists){
            const ele = document.querySelector('.bottom-sheet')
            M.Modal.getInstance(ele).open()
             document.getElementById('details').innerHTML = `<h5>${id}</h5>
             <table>
             <thead>
             <tr>
             <th>Username</th>
             <th>Contact</th>
             <th>Payment</th>
             </tr>
             </thead>
               <tbody>
                 <tr>
                 <td>${doc.data().user_id}</td>
                 <td>${doc.data().contact}</td>
                 <td>${doc.data().payment}</td>
               </tr>
               </tbody>
             </table>`
         }
         else{
             alert('recheck the userid')
         }
     }).catch(err=>{
         alert(err)
     })
       
    })
    username.style.fontStyle = 'bold'
    li.style.borderStyle = 'solid'
    li.style.listStyle = 'none'
    maindiv.appendChild(li)
}
//to remove the complains
function remove(e){
    e.preventDefault()
    const div = e.target.parentElement
    const id = div.getAttribute('data-id')
    db.collection('complain').doc(id).delete().then(res=>{
        alert('complain resolved')
        document.getElementById('complains').removeChild(div)
    })
}

//to add any new announcement
document.getElementById('announcement').addEventListener('submit',(e)=>{
    e.preventDefault()
    const text = document.getElementById('text').value
    const div = document.createElement('div')
    div.setAttribute('class','info')
    div.innerHTML = `<p style="display: inline"><i class="material-icons">star</i> ${text}</p><span class="date"></span><br>`
    div.style.borderStyle = 'solid'
    document.getElementById('infos').innerHTML += div.innerHTML
    document.getElementById('announcement').reset();
    
})
 //controling the interface according to the user
const skip = document.getElementById('next')
skip.addEventListener('click',(e)=>{
    e.preventDefault()
    document.querySelector('.buttons').style.display = 'none'
    document.querySelector('.wrapper').style.display = 'block'
    document.querySelector('.update').style.display = 'none';
    document.querySelector('#a_btn').style.display = 'none';
    document.querySelector('.msg').style.display = 'none'
    
    
})
 const admin = document.querySelector('#admin')
 admin.addEventListener('click',(e)=>{
e.preventDefault()
const pass = prompt('give password')
if(pass == 'admin123'){
    document.querySelector('.buttons').style.display = 'none'
    document.querySelector('.wrapper').style.display = 'block'
    document.querySelector('#add_btn').style.display = 'none'
    
}
else{
    location.reload()
}

 })
