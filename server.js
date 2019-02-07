const express = require('express');
const app = express();
const hbs = require('hbs');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
hbs.handlebars = require('handlebars');
const port = process.env.PORT || 3000 ;

app.use('/public',express.static("public"));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname+'/views/partials');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));




app.get('/', (req,res)=>{
    res.render('home');
});

app.get('/donate' ,(req,res)=>{
    res.render("donate");
});

app.get('/receive' ,(req,res)=>{
    res.render("receive");
});

app.post('/dinfo',(req,res)=>{
    
    
    var data = {
        name : req.body.name,
        mobile : req.body.mobile,
        age: req.body.age,
        bgroup: req.body.bgroup,
        district : req.body.district,
        taluka : req.body.taluka,
        city : req.body.city,
        pincode : req.body.pincode
        }
    MongoClient.connect('mongodb://localhost:27017/bloodbank', {useNewUrlParser : true}, (err, client)=> {
    if(err)
    {
        return console.log("unable to connect to DB");
    }
    db = client.db('bloodbank');

    db.collection('donate').insertOne({
        Name : data.name ,
        Mobile :  data.mobile,
        Age : data.age,
        Blood_Group : data.bgroup,
        District : data.district,
        Taluka : data.taluka,
        City : data.city,
        Pincode : data.pincode
    },(err,result)=>{
        if(err){ 
            res.render("donaters_err",{
                name : req.body.name
            });
            return console.log("Unable to insert data",err);
        }
        console.log(JSON.stringify(result.ops,undefined,2));
        res.render("donate_res", {
            name : req.body.name
        });
    });

    client.close();

});

});

app.post('/rinfo', (req,res)=>{
    
    var item = {
        name : req.body.rname,
        mobile :  req.body.rmobile,
        age : req.body.rage,
        bgroup :  req.body.bgroup,
        district : req.body.district
        
    }

    
    MongoClient.connect('mongodb://localhost:27017/bloodbank', {useNewUrlParser : true}, (err, client)=> {
    if(err)
    {
        return console.log("unable to connect to DB");
    }
    db = client.db('bloodbank');

    db.collection('receiver').insertOne({
        Name : item.name ,
        Mobile :  item.mobile,
        Age : item.age
    });

    db.collection('donate').find({Blood_Group:req.body.bgroup,District: req.body.district},{_id:0,Name:0,Age:0,}).toArray((err,result) =>{
        if(err){
            return console.log("unable to fetch data", err);
        }

        
        hbs.registerHelper('bold', function() {
               return new  hbs.handlebars.SafeString(result);
        });



        res.render("receiver_res",{ 
            rname : item.name,
            rblood_group : item.bgroup,
            rdistrict : item.district,
            result
        });
    })
});
});

app.listen(port, ()=>{
    console.log(`The Server is running in ${port}` );
});