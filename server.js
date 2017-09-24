const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')
const request = require('request-promise')
const admin = require('firebase-admin')

var serviceAccount = require('./capitalonedevexchange-dc8f9-firebase-adminsdk-9a4pt-0ea41b92a0.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://capitalonedevexchange-dc8f9.firebaseio.com'
})

const db = admin.database()

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let USER_INFO = {}

app.prepare().then(() => {
  const server = express()

  server.use(bodyParser.json()) // for parsing application/json
  server.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

  server.post('/login', (req, res) => {
    const postData = { ...req.body, grant_type: 'client_credentials' }
    var options = {
      method: 'POST',
      url: 'https://api.devexhacks.com/oauth2/token',
      headers: {
        'postman-token': '9fbd725f-c225-6b37-b7d2-d29fedaaf13a',
        'cache-control': 'no-cache',
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      form: {
        client_id: postData.client_id,
        client_secret: postData.client_secret,
        grant_type: postData.grant_type
      }
    }

    request(options)
      .then(body => JSON.parse(body))
      .then(result => {
        USER_INFO = result
        res.redirect('/home')
      })
      .catch(response => {
        console.log(response)
        res.redirect('/')
      })
  })

  server.post('/create-coupon', (req, res) => {
    const postData = req.body
    const {
      title,
      chainName,
      description,
      disclosureTitle,
      disclosureText,
      isStoreWide,
      chainContactWeb,
      chainContactPhoneNumber,
      expirationDate,
      isRedeemableInStore
    } = req.body
    var options = {
      method: 'POST',
      url: 'https://api.devexhacks.com/retail-discounts/coupons',
      headers: {
        'postman-token': '024866ff-7d7c-03fa-ce78-177fb80c99d7',
        'cache-control': 'no-cache',
        authorization: 'Bearer ' + USER_INFO.access_token,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: {
        title,
        callbacks: {
          couponClickedUrl: 'https://someurl-couponclicked',
          couponPresentedUrl: 'https://someurl-couponpresented'
        },
        chainName,
        redemption: {
          couponCode: 'Barcode - 850737209241916',
          couponImageUrl:
            'https://www.kohls.com/ecom/PrintPass/SAVEMORE-YOUSAVE-HUGEDEAL/20170914-850737209241916.png'
        },
        description,
        disclosures: [
          {
            title: disclosureTitle,
            disclosureText: disclosureText
          }
        ],
        isStoreWide: isStoreWide === 'on',
        chainContact: {
          webSiteUrl: chainContactWeb,
          phoneNumber: chainContactPhoneNumber
        },
        expirationDate: expirationDate,
        isRedeemableInStore: isRedeemableInStore === 'on'
      },
      json: true
    }

    request(options)
      .then(result => {
        console.log(result)
        const ref = db.ref('coupons/' + result.couponId)
        ref.set(postData)
        const allCoupons = db.ref('coupons')
        allCoupons.once('value', snapshot => {
          const couponsObjects = snapshot.val()
          let couponArray = []
          for (var key in couponsObjects) {
            if (couponsObjects.hasOwnProperty(key)) {
              couponArray.push({ ...couponsObjects[key], id: key, key: key })
            }
          }
          req.query = couponArray
          console.log(req.query)
          app.render(req, res, '/home', req.query)
        })
      })
      .catch(response => {
        console.log(response)
        res.send('fails')
      })
  })

  server.get('/home', (req, res) => {
    const ref = db.ref('coupons')
    console.log('fetching')
    ref.once('value', snapshot => {
      const couponsObjects = snapshot.val()
      let couponArray = []
      for (var key in couponsObjects) {
        if (couponsObjects.hasOwnProperty(key)) {
          couponArray.push({ ...couponsObjects[key], id: key, key: key })
        }
      }
      req.query = couponArray
      console.log(req.query)
      app.render(req, res, '/home', req.query)
    })
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
