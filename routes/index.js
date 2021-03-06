const express = require('express');
const router  = express.Router();
const User = require('../models/User')
const Guest = require('../models/Guest')
// const Lead = require('../models/Lead')
const Visit = require('../models/Visit')
const Place = require('../models/Places')
const bcrypt = require('bcrypt')
let bcryptSalt = 10;
const nodemailer = require('nodemailer');

/* GET home page */
router.get('/', (req, res, next) => {
  Visit.create({visit: 10})
  .then(visit => console.log(visit, 'VISITA_____>created'))
  .catch(err => console.log(err))
  res.render('home');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const {username, password} = req.body;

  if (username === '' || password === '') {
    res.render('signup', { message: "Usuário e/ou Senha vazios" });
    return;
  }

  User.findOne({username})
    .then((user) => {
      if (user) {
        res.render('signup', {message: 'O ususário já existe'})
        return;
      } else {
        let salt = bcrypt.genSaltSync(bcryptSalt)
        let hash = bcrypt.hashSync(password, salt)
        User.create({
          username,
          password: hash
        })
          .then(user => {
            console.log(user.username, 'Criado com sucesso')
            res.redirect('/login')
          })
          .catch(error => console.log(error))
      }
    })
    .catch(err => console.log(err))
});


router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  const {username, password} = req.body;
  
  if (username === '' || password === '') {
    res.render('login', { message: "Usuário e/ou Senha vazios" });
    return;
  }

  User.findOne({username})
    .then(user => {
      if (!user) {
        res.render('login', { message: "Usuário e/ou Password incorretos" });
        return;
      } 

        if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user._id;
        res.redirect('/admin')
      } else {
        res.render('login', { message: "Usuário e/ou Password incorretos" });
        return;
      }
    })
    .catch(error => {
      next(error);
    })
});

router.post('/lead', (req, res, next) => {
  let {email, phone} = req.body;
//   if (email === null  && phone === null) {
//     res.render('home', {message: "Preencha ao menos um dos campos"});
//     return;
//   }

//   let phoneSplit = phone.split('');
//   let phoneClean = phoneSplit.map(ele => {
//     if(ele.charCodeAt() > 47 && ele.charCodeAt() < 58) {
//      return ele;
//     }
//   })
//   phone = phoneClean.join('')
//   console.log(phone)
//    if (phone.length <= 11 && phone.length > 12) {
//      console.log(entrou)
//      res.render('home', {message: "Digite o número com DDD"});
//    }
//   // res.render('home');
if (email === '' && phone === '') {
  res.render('home', { message: "Forneça email ou telefone" });
  return;
}

Guest.findOne({email})
  .then((guest) => {
    if(guest){
      res.render('home', {message: 'Apenas uma inscrição por usuário'})
      return;
    } else {
      Guest.create({
        email,
        phone
      })
        .then(guest => {
          // res.send()
          console.log(guest, 'Criado com sucesso');
        
          if (guest.email !== '') {
            console.log('ENV GMAIL---------->', process.env.GMAIL_PASSWORD);

            let transporter = nodemailer.createTransport({
              service:'gmail',
              port: 587,
              auth: {
                user:"mistura.congelados@gmail.com",
                pass: process.env.GMAIL_PASSWORD 
              }
            });
  
            transporter.sendMail({
              from: 'mistura.congelados@gmail.com',
              to: guest.email, 
              subject: 'Seu cupon com 10% de desconto', 
              text: `Seu cupon com 10% de desconto`,
        
              html: 
              `<h1>Utilze este cupom de 10% de desconto, apresente o codigo YA34567</h1>
              <img style={width: 100vw; height:auto} src="https://mistura.herokuapp.com/cupon-mobile.jpg">`,
            })
  
        
            res.render('home', {message: "Entraremos em contato em breve"});
          } else {
            res.render('home', {message: "Entraremos em contato em breve"} );
          }
        })
        .catch(error => console.log(error))
      }
  })
  .catch(err => console.log(err))
});


router.get('/api/places', (req, res, next) => {
  Place.find()
    .then(place => {
      console.log(place)
      res.status(200).json(place);
    })
    .catch(error => console.log(error))
});



// -------------------------AUTENTICATION----------------------//

router.use((req, res, next) => {
  if(req.session.currentUser) {
    next();
  } else {
    res.redirect('/login')
  }
});


router.get('/admin', (req, res, next) => {
  
  

  Visit.find()
  .then(visits => {
    console.log("---------------------->VISITS", visits)
    let counter = 0;
    visits.forEach(visit => {
      counter += 1
    })

    Guest.find()
  .then(guests => {
    let leads = 0;
    console.log("---------------------->GUESTS", guests)
    guests.forEach(visit => {
      leads += 1
    })
    res.render('admin', {visit: counter, leads: leads })
  })

  })
  .catch(err => console.log(err))

  


 
})



router.post('/add-place', (req, res, next) => {
  const {name, type} = req.body;

  let location = {
    type: 'Point',
    coordinates: [req.body.longitude, req.body.latitude]
    };

  if(name === '' || type === '' || location ==='') {
    res.render('admin', {message: 'Preencha o endereço'})
    return;
  }  
  
  Place.create({name, type, location})
  .then(place => {
    res.render('admin', {message: `${place.name} saved`})
  })
  .catch(err => console.log(err))
})

module.exports = router;
