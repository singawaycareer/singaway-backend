import "dotenv/config"
import http from "node:http"
import {createApp} from "./app"

async function main (){

    const PORT = process.env.PORT || 8000
    const app = await createApp()
    const server = http.createServer(app)

    
    server.listen(PORT , ()=> {
        console.log(`Server is running on port http://localhost:${PORT}`)
    })
    

}
main().catch(err =>{console.log(err); process.exit(1)})

async function shutdown(signal:string){
    console.log(`Received ${signal}, shutting down`)
}