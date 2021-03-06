const { age, date } = require('../../lib/utils')
const db = require('../../config/db')

module.exports = {
    allRecipes(callback){

        db.query(`SELECT recipes.*, chefs.name AS chef_name
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        ORDER BY title ASC`, function(err, results){
            if(err) throw `database Error! ${err}`  

            callback(results.rows)
        })

    },
    allChefs(callback){

        try{ return db.query(`SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
            GROUP BY chefs.id
            ORDER BY total_recipes DESC`)
        }catch (error) { console.error(error)}

    },
    paginate(params) {
        const {filter, limit, offset, callback } = params

        let query = "",
            filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM recipes
             )AS total`
        

        if ( filter ) {
            filterQuery = `
            WHERE recipes.title ILIKE '%${filter}%'`

            totalQuery =
            `(SELECT count(*) FROM recipes 
            ${filterQuery})
             AS total`
        }

        query = `
        SELECT recipes.* ,${totalQuery}, chefs.name AS chef_name, count(*)
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        ${filterQuery}
        GROUP BY chefs.id, recipes.id limit $1 OFFSET $2
        `

        db.query(query, [limit, offset], function(err, results){
            if (err) throw `Database Error! ${err}`

            callback(results.rows)
        })
    },
    findRecipes(id, callback) {
        db.query(`SELECT recipes.*, chefs.name AS chef_name
        FROM recipes
        LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        WHERE recipes.id = $1`, [id], function(err, results){  
            if(err) throw `database Error! ${err}`
            callback(results.rows[0])
        })
    },
    findchef(id, callback) {
        db.query(`SELECT chefs.*, count(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (recipes.chef_id = chefs.id)
        WHERE chefs.id = $1
        GROUP BY chefs.id`, [id], function(err, results){
            if(err) throw `database Error! ${err}`
            callback(results.rows[0])
        })
    },
    findChefRecipes(id, callback){
        db.query(`SELECT *
        FROM recipes
        WHERE chef_id = $1 `, [id], function(err, results){
            if(err) throw `database Error! ${err}`
            callback(results.rows)
        })
    },


    
   
    
  

}