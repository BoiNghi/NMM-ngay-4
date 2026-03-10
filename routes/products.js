const express = require('express')
let router = express.Router()
let { GenID, GetCateByID } = require('../utils/IDHandler')
let slugify = require('slugify')
let {dataProducts,dataCategories} = require('../utils/data')

router.get('/', (req, res) => {
    let result = dataProducts.filter(
        function (e) {
            return !e.isDeleted
        }
    )
    res.send(result)
})
router.get('/:id', (req, res) => {//req.params
    let result = dataProducts.filter(
        function (e) {
            return e.id == req.params.id && !e.isDeleted;
        }
    )
    res.send(result)
})

router.post('/', (req, res) => {
    let newProducts = {
        id: GenID(dataProducts),
        title: req.body.title,
        slug: slugify(req.body.title, {
            replacement: '-',
            lower: false,
            remove: undefined,
        }),
        description: req.body.description,
        category: GetCateByID(req.body.category, dataCategories),
        images: req.body.images,
        creationAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    }
    dataProducts.push(newProducts);
    res.send(newProducts)
})
router.put('/:id', (req, res) => {
    let getProduct = dataProducts.filter(
        function (e) {
            return e.id == req.params.id && !e.isDeleted
        }
    )
    if (getProduct.length > 0) {
        getProduct = getProduct[0];
        let keys = Object.keys(req.body);
        for (const key of keys) {
            if (getProduct[key]) {
                getProduct[key] = req.body[key];
            }
        }
        getProduct.updatedAt = new Date(Date.now());
        res.status(200).send(getProduct)
    } else {
        res.status(404).send("id not found")
    }

})
router.delete('/:id', (req, res) => {
    let getProduct = dataProducts.filter(
        function (e) {
            return e.id == req.params.id && !e.isDeleted
        }
    )
    if (getProduct.length > 0) {
        getProduct = getProduct[0];
        getProduct.isDeleted = true;
        getProduct.updatedAt = new Date(Date.now());
        res.status(200).send(getProduct)
    } else {
        res.status(404).send("id not found")
    }

})

module.exports = router;