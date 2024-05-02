import employer from "../../domain/employer";
import employerInterface from "../../use-case/interface/employerInterface";
import employerModel from "../data-base/employerModel";

class employerRepository implements employerInterface{

    async insertOne(employer: employer): Promise<employer> {
        const newEmployer = new employerModel(employer)
        await newEmployer.save()
        return newEmployer
    }

    async findByEmail(email: string): Promise<employer | null> {
        const employer = await employerModel.findOne({ email:email })
        if (employer) {
            return employer
        } else {
            return null
        }
    }
    
}

export default employerRepository