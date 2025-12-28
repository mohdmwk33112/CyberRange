/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SimulationModule } from '../simulation/simulation.module';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';
import { ScenarioSchema } from './scenario.model';
import { ScenarioStateSchema } from './scenario-state.model';

import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Scenario', schema: ScenarioSchema },
            { name: 'ScenarioState', schema: ScenarioStateSchema },
        ]),
        SimulationModule,
        UserModule,
    ],
    controllers: [ScenarioController],
    providers: [ScenarioService],
    exports: [ScenarioService],
})
export class ScenarioModule { }
