"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('NF-e API (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('GET / returns API name', () => {
        return request(app.getHttpServer()).get('/').expect(200).expect('NF-e Microservice API');
    });
    it('POST /nfe with invalid body returns 400', () => {
        return request(app.getHttpServer())
            .post('/nfe')
            .send({})
            .expect(400);
    });
    it('POST /nfe with valid body creates note and returns id and status', async () => {
        const res = await request(app.getHttpServer())
            .post('/nfe')
            .send({
            emitenteCnpj: '11222333000181',
            emitenteRazaoSocial: 'Emitente Teste Ltda',
            destinatarioCnpj: '06990590000123',
            destinatarioRazaoSocial: 'Destinatario Teste SA',
            itens: [
                { descricao: 'Produto 1', quantidade: 2, valorUnitario: 10.5 },
            ],
        })
            .expect(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status', 'em_processamento');
        expect(res.body).toHaveProperty('numero');
    });
});
//# sourceMappingURL=app.e2e-spec.js.map