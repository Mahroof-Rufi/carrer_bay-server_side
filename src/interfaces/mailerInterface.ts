interface mailerInterface {
    
    sendMail(email:string, subject:string, text?:string, html?:string):boolean
    sendVerificationMail(id:any,to:any):Promise<any>
}
export default mailerInterface