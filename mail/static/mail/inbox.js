document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_mail);
  load_mailbox('inbox');
});


function submit_mail(){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const rec = document.querySelector('#compose-recipients').value;
  const sub = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: body
    })
  })
}

function compose_email() {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function reply_email(mail) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  document.querySelector('#compose-recipients').value = `${mail.sender}`;
  if (mail.subject.includes('RE: ')) {
    document.querySelector('#compose-subject').value = `${mail.subject}`;  
  }
  else{
    document.querySelector('#compose-subject').value = `RE: ${mail.subject}`; 
  }
  document.querySelector('#compose-body').placeholder = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`;

}


function open_mail(mail) { 

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = '';

  const from = document.createElement('div');
  from.innerHTML = `<b>FROM: </b> `;
  from.append(mail.sender);

  const to = document.createElement('div')
  to.innerHTML = `<b>TO: </b> `;
  to.append(mail.recipients);

  const subject = document.createElement('div')
  subject.innerHTML = `<b>SUBJECT: </b> `;
  subject.append(mail.subject);

  const timestamp = document.createElement('div')
  timestamp.innerHTML = `<b>TIMESTAMP: </b> `;
  timestamp.append(mail.timestamp);

  const reply = document.createElement('div');
  reply.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>`

  const line = document.createElement('div');
  line.innerHTML = `<hr>`;

  const message = document.createElement('div');
  message.innerHTML = mail.body;

  const archived = document.createElement('div');
  if (mail.archived === false){
    archived.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="reply">Archive</button>`  
  }
  
  else{
    archived.innerHTML = `<button class="btn btn-sm btn-outline-primary" id="reply">UnArchive</button>`   
  }
  

  const mailv = document.querySelector('#emails-view');
  mailv.append(from);
  mailv.append(to);
  mailv.append(subject);
  mailv.append(timestamp);
  mailv.append(archived);
  mailv.append(line);
  mailv.append(message);
  mailv.append(reply);

  reply.addEventListener('click', function() {
    reply_email(mail);
  })
  

  archived.addEventListener('click', function () {
    if (mail.archived === false){

      setTimeout(function(){
        load_mailbox('archive');
        }, 250);

        fetch(`/emails/${mail.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        load_mailbox('archive')
    }
  
if (mail.archived === true){
  setTimeout(function(){
    load_mailbox('archive');
    }, 250);

    fetch(`/emails/${mail.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })  
}
})
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach( x => {
      let sender = x.sender;
      let subject = x.subject;
      let time = x.timestamp;
      let open = x.read;

      const element = document.createElement('div');
      element.innerHTML = `<span class = 'left'> <strong> ${sender}  | </strong> </span> <span class = 'center'> ${subject} </span>  <span class='right'> <i> ${time}  </i> </span>` 
      element.style.border = "solid";
      element.style.borderWidth = "1px";
       
      if(open == false){
        element.style.backgroundColor = "white";
      }
      else{
        element.style.backgroundColor = "#A0A0A0";
      }
      
      element.addEventListener('click', function() {
      fetch(`/emails/${x.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      fetch(`/emails/${x.id}`)
      .then(response => response.json())
      .then(email => {
      open_mail(email);
    });
      });

    const mailv = document.querySelector('#emails-view')
    mailv.append(element);
    document.querySelector("#emails-view").style.lineHeight = 3;
    });
  }); 
}

