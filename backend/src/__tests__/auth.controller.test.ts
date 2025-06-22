import { expect } from 'chai';
import sinon from 'sinon';
const rewire = require('rewire');
const authControllerModule = rewire('../controllers/authController');
const register = authControllerModule.__get__('register');
const login = authControllerModule.__get__('login');
const getCurrentUser = authControllerModule.__get__('getCurrentUser');
import { PrismaClient } from '../generated/prisma';
import * as authService from '../services/authService';
import httpMocks from 'node-mocks-http';

describe('authController', () => {
  let prismaStub: sinon.SinonStubbedInstance<PrismaClient>;
  let req: any, res: any;

  beforeEach(() => {
    // @ts-ignore
    prismaStub = sinon.createStubInstance(PrismaClient);
    // Use Object.defineProperty to override the read-only user property
    Object.defineProperty(prismaStub, 'user', {
      value: {
        findUnique: sinon.stub(),
        create: sinon.stub(),
      },
      writable: true
    });
    authControllerModule.__set__('prisma', prismaStub);
    res = httpMocks.createResponse();
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('register - new user', async () => {
    req = { body: { email: 'a@b.com', password: 'pw', name: 'A' } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves(null);
    (prismaStub.user.create as sinon.SinonStub).resolves({ id: 1, email: 'a@b.com', password: 'hashed', name: 'A', isAdmin: false });
    sinon.replace(authService, 'hashPassword', sinon.fake.resolves('hashed'));
    sinon.replace(authService, 'signJwt', sinon.fake.returns('token'));
    await register(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it('register - user exists', async () => {
    req = { body: { email: 'a@b.com', password: 'pw', name: 'A' } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves({ id: 1 });
    await register(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('login - success', async () => {
    req = { body: { email: 'a@b.com', password: 'pw' } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves({ id: 1, email: 'a@b.com', password: 'hashed', isAdmin: false });
    sinon.replace(authService, 'comparePassword', sinon.fake.resolves(true));
    sinon.replace(authService, 'signJwt', sinon.fake.returns('token'));
    await login(req, res);
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it('login - invalid credentials', async () => {
    req = { body: { email: 'a@b.com', password: 'pw' } };
    (prismaStub.user.findUnique as sinon.SinonStub).resolves(null);
    await login(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });

  it('getCurrentUser - success', async () => {
    req = { user: { userId: 1, email: 'a@b.com' } };
    await getCurrentUser(req, res);
    expect(res.status.calledWith(200)).to.be.true;
  });

  it('getCurrentUser - unauthorized', async () => {
    req = { user: undefined };
    await getCurrentUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });
}); 