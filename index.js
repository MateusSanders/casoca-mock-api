const { ApolloServer, gql } = require('apollo-server');
const products = require('./sampleData/products.json');
const categories = require('./sampleData/categories.json');
const manufacturers = require('./sampleData/manufacturers.json');
const formats = require('./sampleData/formats.json');
const productSortOptions = require('./sampleData/productSortOptions.json');

const typeDefs = gql`
    type Product {
        id: ID!
        name: String!
        seName: String!
        productType: String
        collection: String
        categories: [String]!
        price: Float
        colors: [Color]
        materials: [Material]
        hasMoreMaterials: Boolean!
        hasMoreSizes: Boolean!
        formats: [String]
        isNew: Boolean!
        manufacturer: Manufacturer!
        cardImage: Image!
        smallImages: [Image]!
        bigImages: [Image]!
    }
    type Color {
        id: ID!
        name: String!
        seName: String!
        hexCode: String!
    }
    type Material {
        id: ID!
        name: String!
        seName: String!
        image: Image!
    }
    type Manufacturer {
        id: ID!
        logo: Image!
        name: String!
        seName: String!
        location: String
    }
    
    type Category {
        id: ID!
        name: String!
        seName: String!
        childCategories: [Category]
    }
    
    type Format {
        id: ID!
        name: String!
        seName: String!
        image: Image!
    }
    
    type SortOption {
        id: ID!
        name: String!
        seName: String!
    }
    
    type Image {
        url: String!
        preloadUrl: String
        alt: String
        width: Int!
        height: Int!
    }

    type Query {
        products(currentPage: Int!, itemsPerPage: Int!, sortBy: String, category: String, formats: [String], manufacturers: [String]): [Product]
        totalProducts(category: String, formats: [String], manufacturers: [String]): Int
        product(seName: String!): Product
        
        manufacturers: [Manufacturer]
        manufacturer(id: ID!): Manufacturer
        
        categories: [Category]
        category(seName: String): Category
        
        formats(seNames: [String]): [Format]
        format(seName: String!): Format
        
        productSortOptions: [SortOption]
    }
`;

const resolvers = {
    Query: {
        products: (parent, args, context, info) => {
            let result = products;

            result = result.filter(p => {
                if (args.category) {
                    return p.categories.includes(args.category)
                } else {
                    return true
                }
            })

            result = result.filter(p => {
                if (args.formats) {
                    for (let f of args.formats) {
                        for (let pf of p.formats) {
                            if(f.toLowerCase() === pf.toLowerCase()) return true
                        }
                    }
                    return false
                } else {
                    return true
                }
            })

            result = result.filter(p => {
                if (args.manufacturers) {
                    return args.manufacturers.includes(p.manufacturer.seName)
                } else {
                    return true
                }
            })

            if (args.currentPage === 1){
                result = result.slice(0, args.itemsPerPage)
            } else {
                result = result.slice((args.currentPage-1)*args.itemsPerPage, args.currentPage*args.itemsPerPage)
            }

            return result
        },

        totalProducts: (parent, args, context, info) => {
            let result = products;

            result = result.filter(p => {
                if (args.category) {
                    return p.categories.includes(args.category)
                } else {
                    return true
                }
            })

            result = result.filter(p => {
                if (args.formats) {
                    for (let f of args.formats) {
                        for (let pf of p.formats) {
                            if(f.toLowerCase() === pf.toLowerCase()) return true
                        }
                    }
                    return false
                } else {
                    return true
                }
            })

            result = result.filter(p => {
                if (args.manufacturers) {
                    return args.manufacturers.includes(p.manufacturer.seName)
                } else {
                    return true
                }
            })

            return result.length
        },

        product: (parent, args, context, info) => products.find(p => p.seName === args.seName),

        manufacturers: () => manufacturers,

        categories: () => categories,
        category: (parent, args, context, info) => categories.find(c => c.seName === args.seName),

        formats: (parent, args, context, info) => {
            if(!args.seNames){
                return formats
            }

            return formats.filter( f => args.seNames.includes(f.seName))
        },

        productSortOptions: () => productSortOptions,
    },
};

const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});