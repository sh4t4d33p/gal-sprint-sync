import { expect } from 'chai';
import sinon from 'sinon';
const rewire = require('rewire');
const aiControllerModule = rewire('../controllers/aiController');
const getTaskDescriptionSuggestion = aiControllerModule.__get__('getTaskDescriptionSuggestion');
import { PrismaClient } from '../generated/prisma';
import * as aiService from '../services/aiService';
import httpMocks from 'node-mocks-http';

describe('aiController', () => {
  let prismaStub: sinon.SinonStubbedInstance<PrismaClient>;
  let req: any, res: any;

  beforeEach(() => {
    // @ts-ignore
    prismaStub = sinon.createStubInstance(PrismaClient);
    // Use Object.defineProperty to override the read-only task property
    Object.defineProperty(prismaStub, 'task', {
      value: { findUnique: sinon.stub() },
      writable: true
    });
    res = httpMocks.createResponse();
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    aiControllerModule.__set__('prisma', prismaStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('getTaskDescriptionSuggestion - success', async () => {
    req = { query: { taskId: 1 } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 1, title: 'T' } as any);
    sinon.replace(aiService, 'generateTaskDescription', sinon.fake.resolves('desc'));
    await getTaskDescriptionSuggestion(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({ description: 'desc' })).to.be.true;
  });

  it('getTaskDescriptionSuggestion - not found', async () => {
    req = { query: { taskId: 2 } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves(null);
    await getTaskDescriptionSuggestion(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('getTaskDescriptionSuggestion - missing taskId', async () => {
    req = { query: {} };
    await getTaskDescriptionSuggestion(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });
}); 