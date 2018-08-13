import {customMatchers, CustomMatchers} from './support/custom-jasmine-matchers';
import {interactionBuilder, pactBuilder} from './support/pact-builder';
import {operationBuilder} from './support/swagger-builder/operation-builder';
import {pathBuilder} from './support/swagger-builder/path-builder';
import {swaggerMockValidatorLoader} from './support/swagger-mock-validator-loader';
import {swagger2Builder} from './support/swagger2-builder';

declare function expect<T>(actual: T): CustomMatchers<T>;

describe('request method', () => {
    const expectedFailedValidationError = 'Mock file "pact.json" is not compatible with swagger file "swagger.json"';

    const invokeSwaggerPactValidator = swaggerMockValidatorLoader.invoke;

    beforeEach(() => {
        jasmine.addMatchers(customMatchers);
    });

    it('should pass when a pact calls a method that is defined in the swagger', async () => {
        const pactFile = pactBuilder
            .withInteraction(interactionBuilder
                .withDescription('interaction description')
                .withRequestPath('/does/exist')
                .withRequestMethodGet()
            )
            .build();

        const swaggerFile = swagger2Builder
            .withPath('/does/exist', pathBuilder.withGetOperation(operationBuilder))
            .build();

        const result = await invokeSwaggerPactValidator(swaggerFile, pactFile);

        expect(result).toContainNoWarningsOrErrors();
    });

    it('should return the error when a pact calls a method that is not defined in the swagger', async () => {
        const pactFile = pactBuilder
            .withInteraction(interactionBuilder
                .withDescription('interaction description')
                .withRequestPath('/does/exist')
                .withRequestMethodPost()
            )
            .build();

        const pathWithGetOperationBuilder = pathBuilder.withGetOperation(operationBuilder);

        const swaggerFile = swagger2Builder
            .withPath('/does/exist', pathWithGetOperationBuilder)
            .build();

        const result = await invokeSwaggerPactValidator(swaggerFile, pactFile);

        expect(result.failureReason).toEqual(expectedFailedValidationError);
        expect(result).toContainErrors([{
            code: 'request.path-or-method.unknown',
            message: 'Path or method not defined in swagger file: POST /does/exist',
            mockDetails: {
                interactionDescription: 'interaction description',
                interactionState: '[none]',
                location: '[pactRoot].interactions[0].request.path',
                mockFile: 'pact.json',
                value: '/does/exist'
            },
            source: 'spec-mock-validation',
            specDetails: {
                location: '[swaggerRoot].paths',
                pathMethod: null,
                pathName: null,
                specFile: 'swagger.json',
                value: {'/does/exist': pathWithGetOperationBuilder.build()}
            },
            type: 'error'
        }]);
    });
});
