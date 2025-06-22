import { expect } from 'chai';
import sinon from 'sinon';
const rewire = require('rewire');
const taskControllerModule = rewire('../controllers/taskController');
const createTask = taskControllerModule.__get__('createTask');
const listTasks = taskControllerModule.__get__('listTasks');
const getTaskById = taskControllerModule.__get__('getTaskById');
const updateTask = taskControllerModule.__get__('updateTask');
const deleteTask = taskControllerModule.__get__('deleteTask');
const patchTaskProgress = taskControllerModule.__get__('patchTaskProgress');
import { PrismaClient } from '../generated/prisma';
import httpMocks from 'node-mocks-http';

describe('taskController', () => {
  let prismaStub: sinon.SinonStubbedInstance<PrismaClient>;
  let req: any, res: any;

  beforeEach(() => {
    // @ts-ignore
    prismaStub = sinon.createStubInstance(PrismaClient);
    // Use Object.defineProperty to override the read-only task property
    Object.defineProperty(prismaStub, 'task', {
      value: {
        create: sinon.stub(),
        findMany: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
      writable: true
    });
    taskControllerModule.__set__('prisma', prismaStub);
    res = httpMocks.createResponse();
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('createTask - user creates own task', async () => {
    req = { user: { userId: 1, isAdmin: false }, body: { title: 'T', description: 'D', status: 'ToDo' } };
    (prismaStub.task.create as sinon.SinonStub).resolves({ id: 1, title: 'T', description: 'D', status: 'ToDo', userId: 1, totalMinutes: 0 });
    await createTask(req, res);
    expect(res.status.calledWith(201)).to.be.true;
  });

  it('createTask - admin assigns to another user', async () => {
    req = { user: { userId: 2, isAdmin: true }, body: { title: 'T', description: 'D', status: 'ToDo', userId: 3 } };
    (prismaStub.task.create as sinon.SinonStub).resolves({ id: 2, title: 'T', description: 'D', status: 'ToDo', userId: 3, totalMinutes: 0 });
    await createTask(req, res);
    expect(res.status.calledWith(201)).to.be.true;
  });

  it('listTasks - admin gets all', async () => {
    req = { user: { userId: 1, isAdmin: true } };
    (prismaStub.task.findMany as sinon.SinonStub).resolves([{ id: 1, userId: 1 }]);
    await listTasks(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('listTasks - user gets own', async () => {
    req = { user: { userId: 2, isAdmin: false } };
    (prismaStub.task.findMany as sinon.SinonStub).resolves([{ id: 2, userId: 2 }]);
    await listTasks(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('getTaskById - found', async () => {
    req = { params: { id: 1 }, user: { userId: 1, isAdmin: false } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 1, userId: 1 });
    await getTaskById(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('getTaskById - not found', async () => {
    req = { params: { id: 2 }, user: { userId: 2, isAdmin: false } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves(null);
    await getTaskById(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('updateTask - user updates own', async () => {
    req = { params: { id: 1 }, user: { userId: 1, isAdmin: false }, body: { title: 'U' } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 1, userId: 1 });
    (prismaStub.task.update as sinon.SinonStub).resolves({ id: 1, userId: 1, title: 'U' });
    await updateTask(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('updateTask - admin reassigns', async () => {
    req = { params: { id: 2 }, user: { userId: 2, isAdmin: true }, body: { userId: 3 } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 2, userId: 2 });
    (prismaStub.task.update as sinon.SinonStub).resolves({ id: 2, userId: 3 });
    await updateTask(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('deleteTask - admin deletes', async () => {
    req = { params: { id: 1 }, user: { userId: 1, isAdmin: true } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 1, userId: 1 });
    (prismaStub.task.delete as sinon.SinonStub).resolves({});
    await deleteTask(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('patchTaskProgress - user updates status', async () => {
    req = { params: { id: 1 }, user: { userId: 1, isAdmin: false }, body: { status: 'Done' } };
    (prismaStub.task.findUnique as sinon.SinonStub).resolves({ id: 1, userId: 1 });
    (prismaStub.task.update as sinon.SinonStub).resolves({ id: 1, userId: 1, status: 'Done' });
    await patchTaskProgress(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });
}); 