import express from 'express'
import { productManager } from './ProductManager.js'

const app = express()
const ProductManager = new productManager('../data/products.json')

app.get( '/products', async (req, res) => {
    try{
        const result = await ProductManager.getProducts()
        const limit = req.query.limit;

        res.status ( 200 ).json({ playload: result.slice(0, limit) })
    }catch{
        res.send( 'No estan disponibles los productos por el momento' )
    }
})

app.get('/products/:id', async ( req, res ) => {
    const id = parseInt(req.params.id)
    try{
        const result = await ProductManager.getProductsById( id );
        return res.status( 200 ).json({ playload: result})
    }catch{
        return res.send({ error: `No se encuenta el id: ${ id }`})
    }
})

app.listen(8080, () => console.log( 'Server Up')); 