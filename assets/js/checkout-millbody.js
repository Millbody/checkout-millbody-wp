//Integrando com dataLayer
try{
	dataLayer.push({
		'event': 'debbug'
	})
} catch(err) {
	var dataLayer = [];
}
var valores_padrao = {
		number: '**** **** **** ****',
		name: 'NOME NO CARTÃO',
		expiry: '**/**',
		cvc: '***'
}

var checkout = {};
var checkoutElement = document.getElementById('millbody-checkout'),
		account = checkoutElement.dataset.account,
		host = 'https://box.millbody.com',
		checkoutUrl = host+'/'+account+'/checkout/',
		planCode = getUrlParameter('plan') || document.getElementById('plan_code').value,
		userToken = getUrlParameter('token');


jQuery(document).ready(function(){
jQuery(document).find('.checkout').ready(function(){
		if(jQuery('body').find('.checkout-payment').length){
				var card = new Card({
						form: '#millbody-checkout',
						container: '.card-wrapper',
						width: '100%',
						height:250,
						formSelectors: {
								numberInput: 'input[name="checkout[payment][credit_card_number]"]',
								nameInput: 'input[name="checkout[payment][credit_card_name]"]',
								expiryInput: 'input[name="checkout[payment][expire_date]"]',
								cvcInput: 'input[name="checkout[payment][cvv]"]',
						},

						placeholders: valores_padrao ,
				});
		

		function getCardFlag(cardnumber) {
				var cardnumber = cardnumber.replace(/[^0-9]+/g, '');

				var cards = {
						visa      : /^4[0-9]{12}(?:[0-9]{3})/,
						mastercard : /^5[1-5][0-9]{14}/,
						diners_club    : /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
						american_express      : /^3[47][0-9]{13}/,
						discover  : /^6(?:011|5[0-9]{2})[0-9]{12}/,
						hipercard  : /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
						elo        : /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
						jcb        : /^(?:2131|1800|35\d{3})\d{11}/,       
						aura      : /^(5078\d{2})(\d{2})(\d{11})$/     
				};

				for (var flag in cards) {
						if(cards[flag].test(cardnumber)) {
								return flag;
						}
				}       

				return false;
		}

		jQuery('input[name="checkout[payment][credit_card_number]"]').on('focusout', function(event){
				var labelCard = getCardFlag(jQuery(this).val());
				jQuery('input[name="checkout[payment][credit_card_label]"]').val(labelCard)
		})

		}

		jQuery('#zipcode').on('keyup', function(event){
		var numberPattern = /\d+/g,
					originalValue = jQuery(this).val().match(numberPattern) ? jQuery(this).val().match(numberPattern).join('') : '',
			zipcode = originalValue;
						zipcodeElement = jQuery(this)
		if(originalValue.length >= 6 && originalValue.length <= 8){
						var addressForm = zipcodeElement.closest('.address-form');

			zipcode = zipcode.slice(0,5)+'-'+zipcode.slice(5)
						if (originalValue.length == 8){
				var myHeaders = new Headers();
				fetch('https://viacep.com.br/ws/'+originalValue+'/json',{
					method: 'GET',
					credentials: 'omit',
					mode: 'cors',
					headers: myHeaders,
				})
				.then( function(response){
					return response.json()
				})
				.then( function(data){
										addressForm.find('.form-address').addClass('active');
										addressForm.find('.continue-zipcode').addClass('hidden');
					addressForm.find('#address').val(data.logradouro);
					addressForm.find('#neighborhood').val(data.bairro);
					addressForm.find('#city').val(data.localidade);
					addressForm.find('#state').val(data.uf);
					addressForm.find('#number').focus();
								})
								.catch( function(error){
										addressForm.find('.form-address').addClass('active');
										addressForm.find('.continue-zipcode').addClass('hidden');
								})
			}
		}
		});
		
		jQuery('.continue-zipcode').on('click', function(event){
				event.preventDefault();
				var addressForm = jQuery(this).closest('.address-form');
				addressForm.find('.form-address').addClass('active');
				addressForm.find('.continue-zipcode').addClass('hidden');

		});

		function GoToNextFromStep(checkoutStep){
				var  valueStep = parseInt(checkoutStep.data('step')),
						nextStep = valueStep+1;
				var validation = validateFormStep(checkoutStep);
				if(validation === false) return false;
				if(nextStep < 4 && !checkoutStep.find('.btn-primary').hasClass('submit-step')){
						checkoutStep.removeClass('enabled').addClass('disabled');
						var nextStepElement = jQuery('.millbody-checkout').find('.step'+nextStep);
						nextStepElement.addClass('enabled').removeClass('disabled')
						nextStepElement.find('input').first().focus();
				} else {
						checkoutStep.closest('.millbody-checkout').submit();
				}        
		}

		jQuery('body').on('click', '.continue-step', function(event){
				event.preventDefault();
				GoToNextFromStep(jQuery('.checkout-step.enabled'));
				var customer = {
					name: getValFromId('name'),
					last_name: getValFromId('last_name'),
					email: getValFromId('email'),
					cpf: getValFromId('cpf'),
					phone: getValFromId('phone'),
					gender: getValFromId('gender') || getValFromId('gender_check') ? 'Feminino' : 'Masculinos',
				}

				if(customer.email) window.localStorage.setItem('Customer', JSON.stringify(customer));

				dataLayer.push({
				'event': 'checkout',
				'ecommerce': {
					'checkout': {
						'actionField': { 'step': jQuery(this).data('step')}
						}
					}
				});
				dataLayer.push({
					'event': 'step-checkout',
					'step': jQuery(this).data('step')
				})
		});

		jQuery('body').on('click', '.back-step', function(event){
				event.preventDefault();
				var checkoutStep = jQuery(this).closest('.checkout-step'),
						valueStep = parseInt(checkoutStep.data('step')),
						backStep = valueStep-1;
				// var validation = validateFormStep(checkoutStep);
				// if(validation === false) return false;
				if(backStep > 0){
						checkoutStep.removeClass('enabled').addClass('disabled');
						var nextStepElement = jQuery('.millbody-checkout').find('.step'+backStep);
						nextStepElement.addClass('enabled').removeClass('disabled')
						nextStepElement.find('input').first().focus();
				}
		});

		jQuery('body').on('keyup', 'input', function(event){
				jQuery(this).removeClass('validation-failed');
		});

		jQuery('body').on('focusout','input', function(event){
				if(jQuery(this).attr('required')) ValidationUxInput(jQuery(this));
		});

		jQuery('body').on('submit', '.millbody-checkout', function(event){
			submitForm(event);
		});

		jQuery('form').find('input').focusout(function(){
				dataLayer.push({
						'event': 'focusout',
						'formField': jQuery(this).attr('name')
				})
			});
				// MASKS
				jQuery('#cpf').mask('000.000.000-00');
				jQuery('#zipcode').mask('00000-000');
				jQuery('#phone').mask('(00) 00000-0000');
				jQuery('input[name="checkout[payment][expire_date]"]').mask('00/00');
				jQuery('input[name="checkout[payment][cvv]"]').mask('000');
				
				var myHeaders = new Headers({"Content-Type": "application/json", "Accept": "application/json"});
				fetch( checkoutUrl+'?plan_code='+planCode+'&token='+userToken, {
					method: 'GET',
					credentials: 'omit',
					mode: 'cors',
					headers: myHeaders,
				})
				.then( function(response){
					return response.json()
				})
				.then( function(response){
						var planName = jQuery('#planName'),
								planDescription = jQuery('#planDescription'),
								planValue = jQuery('#planValue'),
								installments = jQuery('#installments'),
								i = 1,
								planValueText,
								planValueTextMajor;

								installments.find('option').remove(),
								plan = response.plan,
								planValueNumber = parseFloat(plan.value).toFixed(2),
								planInstallments = plan.installments || 1,
								user = response.user;
						checkout.plan = plan;
						checkout.plan.planValueNumber = planValueNumber;
						checkout.plan.planInstallments = planInstallments;

						var customerStorage = localStorage.getItem('Customer');
						if(customerStorage && !user){
							var customerJSON = JSON.parse(customerStorage);	
							document.getElementById('name').value = customerJSON.name;
							document.getElementById('last_name').value = customerJSON.last_name;
							document.getElementById('email').value = customerJSON.email;
							document.getElementById('cpf').value = customerJSON.cpf;
							document.getElementById('phone').value = customerJSON.phone;
							jQuery('.step1').removeClass('enabled').addClass('disabled');
							jQuery('.step2').removeClass('disabled').addClass('enabled');
						}

						if(user){
							jQuery('.step1').removeClass('enabled').addClass('disabled');
							jQuery('.step2').removeClass('disabled').addClass('enabled');
							jQuery('#email').closest('.row').remove();
							jQuery('#gender_check').closest('.row').remove();
							jQuery('#name').closest('.row').remove();
							jQuery('#last_name').closest('.row').remove();
							jQuery('#cpf').closest('.row').remove();
							jQuery('#phone').closest('.row').remove();
							jQuery('.address-form').remove();
							jQuery('.step1').append('<div class="row"><div class="col s12">'+user.name+'</div></div>');
							jQuery('.step1').append('<div class="row"><div class="col s12">'+user.email+'</div></div>')
							jQuery('body').find('.checkout').find('#credit_card_number').focus();
						}
										try{
												dataLayer.push({
														'event': 'checkout',
														'ecommerce': {
														'checkout': {
															'actionField': {'step': jQuery('.checkout').find('.checkout-step.enabled').data('step') },
															'products': [{
																'id': planCode,
																	'name': plan.name,
																	'price': parseFloat(plan.value).toFixed(2),
																	'quantity': 1,
															}]
																		}
															}
													});
										}catch(e){
												console.log('ERROR ', e)
										}
								do{
										installments.append('<option value="'+i+'"'+(i == planInstallments ? 'selected' : '')+'>'+ i +'x R$'+(planValueNumber/i).toFixed(2)+'</option>')
										i += 1;
								} while( i <= planInstallments );
								planName.text(plan.name);
								planDescription.text(plan.description);
								planValueTextMajor = '<span>'+planInstallments+'x R$'+(planValueNumber/planInstallments).toFixed(2)+'</span>';
								planInstallments > 1 ? planValueText = planValueTextMajor+'<br/><small>(Total R$'+planValueNumber+')</small>' : planValueText = planValueTextMajor
								planValue.html(planValueText)
						})
						.catch( function(error){
							dataLayer.push({
								'event': 'error',
								'errorMessage': JSON.stringify(error)
							});
							console.log('error consulta ', error);
						});
		});
});

function validateFormStep(step){
		var validation;
		step.find('input[required]').each(function(){
				validation = ValidationUxInput(jQuery(this));
				if(validation.hasClass('validation-failed')) return validation = false && false;
		})
		return !!validation
}

function ValidationUxInput(input){
		validation = ValidateInput(input);
		return !!validation ? input.removeClass('validation-failed').addClass('validation-success') : input.removeClass('validation-success').addClass('validation-failed');
}

function ValidateInput(input){
		var inputValue = input.val();
		var validation = {
				email: input.val() ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( input.val().trim()) : false,
				name: !!input.val() && input.val().length > 1,
				last_name: !!input.val() && input.val().length > 1,
				cpf: !!input.val() && TestaCPF( input.val() ),
				phone: !!input.val() && input.val().match(/\d+/g) ? input.val().match(/\d+/g).join('').length == 11 : false,
				zipcode: !!input.val() && input.val().match(/\d+/g) ? input.val().match(/\d+/g).join('').length == 8 : false,
				address: !!input.val() && input.val().length > 3,
				number: !!input.val() && input.val().length > 0,
				neighborhood: !!input.val() && input.val().length > 1,
				city: !!input.val() && input.val().length > 1,
				state: !!input.val() && input.val().length == 2,
				credit_card_number: !!input.val() && input.val().match(/\d+/g) ? input.val().match(/\d+/g).join('').length == 16 : false,
				credit_card_name: !!input.val() && input.val().length > 1,
				expire_date: !!input.val() && TestaExpireDate(inputValue),
				cvv: !!input.val() && input.val().match(/\d+/g) ? inputValue.match(/\d+/g).join('').length >=3 : false,
		}
		return validation[input.attr('id')]
}

function TestaCPF(cpfValue) {
		var filteredCpf = cpfValue.match(/\d+/g);
		if(filteredCpf){
				var strCPF = (!!filteredCpf && filteredCpf.join(''))
				var Soma;
				var Resto;
				Soma = 0;
			if (strCPF == "00000000000") return false;
				
			for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
			Resto = (Soma * 10) % 11;
			
				if ((Resto == 10) || (Resto == 11))  Resto = 0;
				if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
			
			Soma = 0;
				for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
				Resto = (Soma * 10) % 11;
			
				if ((Resto == 10) || (Resto == 11))  Resto = 0;
				if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
				return true;
		}else{
				return false;
		}
}

function TestaExpireDate(exipreDate){
	var regexExpireDate = exipreDate.match(/\d+/g), dateToday = new Date();
	if(!regexExpireDate) return false;
		if(regexExpireDate.join('').length < 4) return false;
		if("20"+regexExpireDate[1] < dateToday.getFullYear()) return false;
		if("20"+regexExpireDate[1] == dateToday.getFullYear() && regexExpireDate[0] <= dateToday.getMonth()+1) return false;
		return true;
}