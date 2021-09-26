// remover Toast materialize (diminuir o requirement)
var g = document.createElement('div');
g.setAttribute("id", "snackbar");
document.body.appendChild(g);

var SnackBar = function (message, timing) {
	var x = document.getElementById("snackbar");
	x.innerHTML = message;
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, timing || 3000);
}
function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

	for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
			}
	}
};

function getValFromId(idLabel){
	return jQuery('#'+idLabel).val() ? jQuery('#'+idLabel).val().trim() : jQuery('#'+idLabel).val();
}

function submitForm(event){
	event.preventDefault();
	
	var loadingComponent = jQuery('.loading-component'),
			activeStepElement = jQuery('.millbody-checkout').find('.checkout-step.enabled'),
			redirect = checkoutElement.dataset.redirect,
			successComponent = jQuery('.success-order'),
			activeStep = parseInt( activeStepElement.data('step') ),
			customer = {
									name: getValFromId('name'),
									last_name: getValFromId('last_name'),
									email: getValFromId('email'),
									cpf: getValFromId('cpf'),
									phone: getValFromId('phone'),
									gender: getValFromId('gender') || getValFromId('gender_check') ? 'Feminino' : 'Masculino',
									billing: {
											zipcode: getValFromId('zipcode'),
											address: getValFromId('address'),
											number: getValFromId('number'),
											complement: getValFromId('complement'),
											neighborhood: getValFromId('neighborhood'),
											city: getValFromId('city'),
											state: getValFromId('state')
									}
							}
			checkout.customer = customer;
			body = {
					checkout: {
							plan_code: planCode,
							payment: {
									credit_card_number: getValFromId('credit_card_number'),
									credit_card_name: getValFromId('credit_card_name'),
									expire_date: getValFromId('expire_date'),
									cvv: getValFromId('cvv'),
									credit_card_label: getValFromId('credit_card_label'),
									installments: getValFromId('installments')
							}
					}
			}

			userToken ? body.checkout.token = userToken : body.checkout.customer = customer;

	if(activeStep < 3 && !activeStepElement.hasClass('submit-step')){
			var validation = validateFormStep(activeStepElement);
			loadingComponent.removeClass('active');
			if(validation === false) return false;
			GoToNextFromStep(jQuery('.millbody-checkout').find('.checkout-step.enabled'));
	} else {
			if(!loadingComponent.hasClass('active')){
				loadingComponent.addClass('active');
			}
			if( !getValFromId('credit_card_label') ){
				SnackBar('Cartão inv&aacute;lido! Por favor, revise os dados para continuar')
				return false;
			}
			jQuery.ajax({
					type: "POST",
					url: checkoutUrl, 
					data: JSON.stringify(body),
					contentType: "application/json",
					dataType: 'json'
			})
			.done( function(response) {
					try{
							dataLayer.push({
								'event': 'purchase',
									'ecommerce':{
											'purchase': {
												'actionField': {
													'id': checkout.customer.email,
													'affiliation': 'Online Store',
													'revenue': checkout.plan.planValueNumber,
												},
												'products':[{
													'id': planCode,
													'name': checkout.plan.name,
													'price': checkout.plan.planValueNumber,
													'quantity': 1,
												}]
											}
								}
							});
							dataLayer.push({
								'event': 'subscriptionConfirm',
								'orderSubscriber': {
									'id': checkout.customer.email,
									'planCode': planCode,
									'planName': checkout.plan.name,
									'price': checkout.plan.planValueNumber,
								}
							});
						window.localStorage.removeItem('Customer');
						checkoutElement.remove();
					} catch (err){
						dataLayer.push({
							'event': 'error',
							'errorMessage': JSON.stringify(err)
						})
						console.log('ERROR: ', err)
					}
					if(redirect){
						var redirect_url = redirect+'?pan-code='+planCode+'&plan-name='+checkout.plan.name+'&plan-price='+checkout.plan.planValueNumber+'&order-id='+checkout.customer.email;
						window.location = redirect_url;
					} else {
						successComponent.addClass('active');
						loadingComponent.removeClass('active');
					}
					
			})
			.fail( function(error){
					loadingComponent.removeClass('active');
					SnackBar('N&atilde;o foi poss&iacute;vel confirmar seu pedido junto a operadora do cart&atilde;o')
					dataLayer.push({
						'event': 'error',
						'errorMessage': JSON.stringify(error)
					})
					console.log('Error checkout ', error);
			});
	}
}