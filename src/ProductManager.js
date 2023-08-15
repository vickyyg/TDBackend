import fs from 'fs'

export class ProductManager {
    #_path;
    constructor( path ){
        this.#_path = path;
    }

    async #prodJSON( product, productsReady ){
        if ( productsReady ){
            await fs.promises.writeFile( this.#_path, JSON.stringify( productsReady, null, 2 ))
            return productsReady;
        }
        const isProducts = fs.existsSync(this.#_path);
        let products = []
        if( isProducts ) {
            let data = await fs.promises.readFile( this.#_path, "utf-8")
            products = [...JSON.parse( data )]
        }
        if( product ) products.push( product )
        await fs.promises.writeFile(this.#_path, JSON.stringify(products, null, 2) )
    
        return products
    }

    async generateId (){
        const products = await this.#prodJSON()
        return products.at(-1)?.id + 1 || 1;
    }

    async addProduct( product ){
        const { title, description, price, thumbnail, code, stock } = product
        if ( !title || !description || !price || !thumbnail || !code || !stock ) throw new Error('Must submit all required fields')
        const products = await this.#prodJSON()
        if (products.some( p => p.code === code )) throw new Error(`Code: ${ code } must be unique, now is repetead!`);

        product.id = await this.generateId()
        await this.#prodJSON( product )
        return product
    }

    getProducts = async() => await this.#prodJSON();

    getProductsById = async( id ) => {
        const products = await this.#prodJSON()
        const product = products.find( p => p.id === id )
        if ( !product ) throw new Error( `DIN´T FOUND A PRODUCT WITH ID: ${ id }`)

        return product
    }
    
    async updateProduct( id, product){
        const { title, description, price, thumbnail, code, stock } = product
        if ( !id || (!title && !description && !price && !thumbnail && !code && !stock) ) throw new Error('Must be an ID and property to change like => {stock:222, description: "Hello World"}')
        let products = await this.#prodJSON()
        const isRepeteadCode = products.some( p => p.code === code )
        if ( isRepeteadCode ) throw new Error( `Code must be unique: ${ code }` )

        const newProd = {}
        const newProducts = products.map( p => {
            if ( p.id === id ) {
                for ( const prop in p ) newProd[prop] = product[prop] || p[prop];
                return newProd;
            }
            return p
        })
        await this.#prodJSON( null, newProducts )
        return newProducts
    }

    async deleteProduct( id ) {
        let products = await this.getProducts()
        if ( !products.some( p => p.id === id )) throw new Error(`ID: ${ id } not found`);

        products = products.filter( p => p.id !== id )
        await this.#prodJSON( null, products )
        return products;
    }
}