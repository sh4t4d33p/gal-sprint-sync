import { expect } from 'chai';
import sinon from 'sinon';
const rewire = require('rewire');
const userControllerModule = rewire('../controllers/userController');
const getAllUsers = userControllerModule.__get__('getAllUsers');
const getUserById = userControllerModule.__get__('getUserById');
const updateUser = userControllerModule.__get__('updateUser');
const deleteUser = userControllerModule.__get__('deleteUser');
const statsTopUsers = userControllerModule.__get__('statsTopUsers');
const statsTimeLoggedPerDay = userControllerModule.__get__('statsTimeLoggedPerDay');
import { PrismaClient } from '../generated/prisma';
import httpMocks from 'node-mocks-http';

describe('userController', () => {
  let prismaStub: sinon.SinonStubbedInstance<PrismaClient>;
  let req: any, res: any;

  beforeEach(() => {
    // @ts-ignore
    prismaStub = sinon.createStubInstance(PrismaClient);
    // Use Object.defineProperty to override the read-only user and task properties
    Object.defineProperty(prismaStub, 'user', {
      value: {
        findMany: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
      writable: true
    });
    Object.defineProperty(prismaStub, 'task', {
      value: {
        groupBy: sinon.stub(),
      },
      writable: true
    });
    userControllerModule.__set__('prisma', prismaStub);
    res = httpMocks.createResponse();
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('getAllUsers - admin returns users', async () => {
    req = { user: { isAdmin: true } };
    (prismaStub.user.findMany as sinon.SinonStub).resolves([{ id: 1, email: 'a@b.com', password: 'x', name: 'A', isAdmin: false }]);
    await getAllUsers(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it('getAllUsers - non-admin forbidden', async () => {
    req = { user: { isAdmin: false } };
    await getAllUsers(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('getUserById - found', async () => {
    req = { params: { id: 1 }, user: { userId: 1 } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves({ id: 1, email: 'a@b.com', password: 'x', name: 'A', isAdmin: false });
    await getUserById(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('getUserById - not found', async () => {
    req = { params: { id: 2 }, user: { userId: 2 } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves(null);
    await getUserById(req, res);
    expect(res.status.calledWith(404)).to.be.true;
  });

  it('updateUser - success', async () => {
    req = { params: { id: 1 }, user: { userId: 1, isAdmin: false }, body: { name: 'B', email: 'b@b.com' } };
    (prismaStub.user.update as sinon.SinonStub).resolves({ id: 1, email: 'b@b.com', password: 'x', name: 'B', isAdmin: false });
    await updateUser(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('updateUser - forbidden', async () => {
    req = { params: { id: 2 }, user: { userId: 1, isAdmin: false }, body: {} };
    await updateUser(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('deleteUser - admin success', async () => {
    req = { params: { id: 1 }, user: { isAdmin: true } };
    (prismaStub.user.delete as sinon.SinonStub).resolves({});
    await deleteUser(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('deleteUser - forbidden', async () => {
    req = { params: { id: 1 }, user: { isAdmin: false } };
    await deleteUser(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('statsTopUsers - admin returns data', async () => {
    req = { user: { isAdmin: true } };
    (prismaStub.task.groupBy as sinon.SinonStub).resolves([{ userId: 1, _sum: { totalMinutes: 10 } }]);
    (prismaStub.user.findMany as sinon.SinonStub).resolves([{ id: 1, name: 'A', email: 'a@b.com' }]);
    await statsTopUsers(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('statsTopUsers - forbidden', async () => {
    req = { user: { isAdmin: false } };
    await statsTopUsers(req, res);
    expect(res.status.calledWith(403)).to.be.true;
  });

  it('statsTimeLoggedPerDay - admin returns data', async () => {
    req = { user: { isAdmin: true }, query: {} };
    (prismaStub.task.groupBy as sinon.SinonStub).resolves([{ userId: 1, createdAt: new Date(), _sum: { totalMinutes: 5 } }]);
    (prismaStub.user.findMany as sinon.SinonStub).resolves([{ id: 1, name: 'A', email: 'a@b.com' }]);
    await statsTimeLoggedPerDay(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });
}); 