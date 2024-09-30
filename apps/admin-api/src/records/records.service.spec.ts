import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { RecordsService } from '@/records/records.service';
import { AdminFilterOperator, AdminFilterType } from '@repo/types';

describe('RecordsService - Integration Test with Filter Types', () => {
  let service: RecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordsService, PrismaService],
    }).compile();

    service = module.get<RecordsService>(RecordsService);

    const johnDoe = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        isAdmin: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    });

    const janeSmith = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'hashedpassword',
        isAdmin: true,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2023-03-15'),
      },
    });

    const aliceJohnson = await prisma.user.create({
      data: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        password: 'hashedpassword',
        isAdmin: false,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date('2023-06-01'),
      },
    });

    await prisma.product.createMany({
      data: [
        { name: 'Product A', price: 50, stock: 10 },
        { name: 'Product B', price: 100, stock: 20 },
        { name: 'Product C', price: 150, stock: 30 },
      ],
    });

    await prisma.post.createMany({
      data: [
        { title: 'Post by John', content: 'Content A', authorId: johnDoe.id },
        {
          title: 'Another Post by John',
          content: 'Content B',
          authorId: johnDoe.id,
        },
        { title: 'Post by Jane', content: 'Content C', authorId: janeSmith.id },
        {
          title: 'Post by Alice',
          content: 'Content D',
          authorId: aliceJohnson.id,
        },
      ],
    });
  });

  const textTestCases = [
    {
      description: 'should filter by TEXT with CONTAINS operator',
      filters: [
        {
          modelName: 'user',
          field: 'firstName',
          operator: AdminFilterOperator.CONTAINS,
          value: 'Jo',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          isAdmin: false,
        },
      ],
      expectedTotal: 1,
    },
    {
      description: 'should filter by TEXT with EQUALS operator',
      filters: [
        {
          modelName: 'user',
          field: 'firstName',
          operator: AdminFilterOperator.EQUALS,
          value: 'Jane',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 1,
    },
    {
      description: 'should filter by TEXT with STARTS_WITH operator',
      filters: [
        {
          modelName: 'user',
          field: 'firstName',
          operator: AdminFilterOperator.STARTS_WITH,
          value: 'Ja',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 1,
    },
    {
      description: 'should filter by TEXT with ENDS_WITH operator',
      filters: [
        {
          modelName: 'user',
          field: 'lastName',
          operator: AdminFilterOperator.ENDS_WITH,
          value: 'ith',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 1,
    },
  ];

  const booleanTestCases = [
    {
      description: 'should filter by BOOLEAN with EQUALS operator',
      filters: [
        {
          modelName: 'user',
          field: 'isAdmin',
          operator: AdminFilterOperator.EQUALS,
          value: 'true',
          type: AdminFilterType.BOOLEAN,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 1,
    },
  ];

  const dateTestCases = [
    {
      description: 'should filter by DATE with EQUALS operator',
      filters: [
        {
          modelName: 'user',
          field: 'createdAt',
          operator: AdminFilterOperator.EQUALS,
          value: '2023-03-15',
          type: AdminFilterType.DATE,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 1,
    },
    {
      description: 'should filter by DATE with GREATER_THAN operator',
      filters: [
        {
          modelName: 'user',
          field: 'createdAt',
          operator: AdminFilterOperator.GREATER_THAN,
          value: '2023-01-01',
          type: AdminFilterType.DATE,
        },
      ],
      expectedResults: [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
        {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
          isAdmin: false,
        },
      ],
      expectedTotal: 2,
    },
    {
      description: 'should filter by DATE with LESS_THAN operator',
      filters: [
        {
          modelName: 'user',
          field: 'createdAt',
          operator: AdminFilterOperator.LESS_THAN,
          value: '2023-06-01',
          type: AdminFilterType.DATE,
        },
      ],
      expectedResults: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          isAdmin: false,
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          isAdmin: true,
        },
      ],
      expectedTotal: 2,
    },
  ];

  [...textTestCases, ...booleanTestCases, ...dateTestCases].forEach(
    ({ description, filters, expectedResults, expectedTotal }) => {
      it(description, async () => {
        const modelName = 'user';
        const page = 1;
        const perPage = 10;

        // Call the service's findMany method
        const result = await service.findMany(
          modelName,
          page,
          perPage,
          filters,
        );

        // Validate the filtered results
        expect(result.paginatedResult.data).toIncludeAllPartialMembers(
          expectedResults,
        );

        // Validate pagination metadata
        expect(result.paginatedResult.meta).toEqual({
          currentPage: 1,
          lastPage: 1,
          next: null,
          perPage: 10,
          prev: null,
          total: expectedTotal,
        });
      });
    },
  );

  const numberTestCases = [
    {
      description: 'should filter by NUMBER with EQUALS operator',
      filters: [
        {
          modelName: 'product',
          field: 'price',
          operator: AdminFilterOperator.EQUALS,
          value: '100',
          type: AdminFilterType.NUMBER,
        },
      ],
      expectedResults: [{ name: 'Product B', price: 100, stock: 20 }],
      expectedTotal: 1,
    },
    {
      description: 'should filter by NUMBER with GREATER_THAN operator',
      filters: [
        {
          modelName: 'product',
          field: 'price',
          operator: AdminFilterOperator.GREATER_THAN,
          value: '50',
          type: AdminFilterType.NUMBER,
        },
      ],
      expectedResults: [
        { name: 'Product B', price: 100, stock: 20 },
        { name: 'Product C', price: 150, stock: 30 },
      ],
      expectedTotal: 2,
    },
    {
      description: 'should filter by NUMBER with LESS_THAN operator',
      filters: [
        {
          modelName: 'product',
          field: 'price',
          operator: AdminFilterOperator.LESS_THAN,
          value: '150',
          type: AdminFilterType.NUMBER,
        },
      ],
      expectedResults: [
        { name: 'Product A', price: 50, stock: 10 },
        { name: 'Product B', price: 100, stock: 20 },
      ],
      expectedTotal: 2,
    },
  ];

  [...numberTestCases].forEach(
    ({ description, filters, expectedResults, expectedTotal }) => {
      it(description, async () => {
        const modelName = 'product';
        const page = 1;
        const perPage = 10;

        const result = await service.findMany(
          modelName,
          page,
          perPage,
          filters,
        );

        // Validate the filtered results
        expect(result.paginatedResult.data).toIncludeAllPartialMembers(
          expectedResults,
        );

        // Validate pagination metadata
        expect(result.paginatedResult.meta).toEqual({
          currentPage: 1,
          lastPage: 1,
          next: null,
          perPage: 10,
          prev: null,
          total: expectedTotal,
        });
      });
    },
  );

  const nestedTestCases = [
    {
      description:
        'should filter Posts by related User firstName using EQUALS operator',
      filters: [
        {
          modelName: 'author', // must match the related model name from schema/dashboard
          field: 'firstName',
          operator: AdminFilterOperator.EQUALS,
          value: 'John',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [
        { title: 'Post by John', content: 'Content A' },
        { title: 'Another Post by John', content: 'Content B' },
      ],
      expectedTotal: 2,
    },
    {
      description:
        'should filter Posts by related User lastName using CONTAINS operator',
      filters: [
        {
          modelName: 'author', // must match the related model name from schema/dashboard
          field: 'lastName',
          operator: AdminFilterOperator.CONTAINS,
          value: 'Smith',
          type: AdminFilterType.TEXT,
        },
      ],
      expectedResults: [{ title: 'Post by Jane', content: 'Content C' }],
      expectedTotal: 1,
    },
  ];

  nestedTestCases.forEach(
    ({ description, filters, expectedResults, expectedTotal }) => {
      it(description, async () => {
        const modelName = 'post';
        const page = 1;
        const perPage = 10;

        const result = await service.findMany(
          modelName,
          page,
          perPage,
          filters,
        );

        // Validate the filtered results
        expect(result.paginatedResult.data).toIncludeAllPartialMembers(
          expectedResults,
        );

        // Validate pagination metadata
        expect(result.paginatedResult.meta).toEqual({
          currentPage: 1,
          lastPage: 1,
          next: null,
          perPage: 10,
          prev: null,
          total: expectedTotal,
        });
      });
    },
  );
});
