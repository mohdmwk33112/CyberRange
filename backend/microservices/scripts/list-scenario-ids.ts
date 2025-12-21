/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { ScenarioSchema } from '../src/scenario/scenario.model';

dotenv.config();

async function listScenarios() {
    try {
        await mongoose.connect(process.env.DB);
        const ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
        const scenarios = await ScenarioModel.find({}, { _id: 1, title: 1, slug: 1 });
        console.log(JSON.stringify(scenarios, null, 2));
        await mongoose.connection.close();
    } catch (error) {
        console.error(error);
    }
}

listScenarios();
