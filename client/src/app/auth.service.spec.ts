import { TestBed, async, inject } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { } from 'jasmine';

describe('AuthService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AuthService]
		});
	});

	it('should ...', inject([AuthService], (service: AuthService) => {
		expect(service).toBeTruthy();
	}));
});
