interface mailerInterface {
    
    sendMail(email:string, subject:string, text?:string, html?:string):Promise<boolean>
    sendVerificationMail(id:any,to:any):Promise<any>
}
export default mailerInterface