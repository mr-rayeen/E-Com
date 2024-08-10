const axios = require('axios');
const fs = require('fs');
const path = require("path");



function writeData(data, filename) {
    return  new Promise(async (resolve, reject) => {
        try {
            await fs.writeFileSync(filename, JSON.stringify(data));
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}

let productsArr = [];
function getdata() {
    axios
      .get("https://dummyjson.com/products?limit=10&skip=0&select=title,price,description,brand,category,thumbnail")
      .then((res) => {
          let data = res.data;
          let arr = data.products;
          let filename = path.join(__dirname, "dataset.json");
          arr.forEach(p => {
              let name = p.title;
            let price = p.price;
            let description = p.description;
            let category = p.category;
            category = category[0].toUpperCase() + category.slice(1);
            let imageUrl = p.thumbnail;
            let seller = p.brand;

            let obj = { name, price, description, category, imageUrl, seller };
            productsArr.push(obj);
          });
          writeData(productsArr, filename);
      })
      .catch((err) => {
        console.log(err);
      });
}
getdata()
