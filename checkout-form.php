<div id="assinar" class="checkout template-onestepcheckout">
				<form method="POST" action="https://box.millbody.com/<?php echo $account ?>/checkout/" data-account="<?php echo $account ?>" id="millbody-checkout" class="millbody-checkout" <?php if ($redirect) echo "data-redirect='$redirect'" ?> onsubmit="submitForm">
            <input type="hidden" id="success_url" name="checkout[payment][success_url]" value="<?php if ($redirect) echo $redirect ?>">
						<div class="row">
								<div class="col s12 checkout-step step1 enabled" data-step="1">
                  <div class="row">
                    <div class="col s12 m8">
                      <div class="row">
                          <div class="col s12">
                              <h3 class="step-title">Seus dados</h3>
                              <input type="hidden" id="plan_code" name="checkout[plan_code]" value="<?php echo $plan_code ?>">
                          </div>
                      </div>
                      <div class="row">
                          <div class="col s12">
                              <div class="switch">
                                  <label>
                                    Masculino
                                    <input type="checkbox" id="gender_check" name="checkout[customer][gender_check]" checked>
                                    <span class="lever"></span>
                                    Feminino
                                  </label>
                              </div>
                          </div>
                      </div>
                      <div class="row">
                          <div class="col s6">
                              <label for="name">Nome*</label>
                              <input tabindex="1" type="text" id="name" name="checkout[customer][name]" placeholder="Digite seu nome" required/>
                              <small class="validation-message">Você precisa preencher esse campo</small>
                          </div>
                          <div class="col s6">
                              <label for="last_name">Sobrenome*</label>
                              <input tabindex="2" type="text" id="last_name" name="checkout[customer][last_name]" placeholder="Digite seu sobrenome" required/>
                              <small class="validation-message">Você precisa preencher esse campo</small>
                          </div>
                          <div class="col s12">
                              <label for="email">E-mail*</label>
                              <input tabindex="3" type="email" id="email" name="checkout[customer][email]" placeholder="Digite seu e-mail" required/>
                              <small class="validation-message">Digite um email válido</small>
                          </div>
                          <div class="col s6">
                              <label for="cpf">CPF*</label>
                              <input  tabindex="4" type="tel" id="cpf" name="checkout[customer][cpf]" placeholder="Digite seu CPF" required/>
                              <small class="validation-message">Digite um CPF válido</small>
                          </div>
                          <div class="col s6">
                              <label for="phone">Telefone*</label>
                              <input tabindex="5" type="tel" id="phone" name="checkout[customer][phone]" placeholder="Digite seu telefone" required/>
                              <small class="validation-message">Digite um telefone válido</small>
                          </div>
                      </div>
                    </div>
                  </div>
										<div class="row">
											<div class="col s12 m8">
													<button class="btn btn-primary continue-step" data-step="2">Continuar</button>
											</div>
										</div>
								</div>
								<div class="col s12 checkout-step submit-step step2 disabled checkout-payment" data-step="2">
										<div class="row">
												<div class="col s12">
														<h3 class="step-title">Pagamento com cartão de crédito</h3>
												</div>
										</div>
										<div class="row">
                      <div class="col s12">

                      </div>
                      <div class="row">
                          <div class="col s12">
                              <div class="card-wrapper"></div>
                          </div>
                      </div>
                      <div class="row">
                        <div class="col s12 m8">
                          <div class="row">
                                <div class="col s12">
                                  <label for="credit_card_number">Número do cartão de crédito</label>
                                  <input tabindex="6" type="tel" id="credit_card_number" placeholder="Número do cartão" name="checkout[payment][credit_card_number]" required/>
                                  <small class="validation-message">Digite um número de cartão válido</small>
                                </div>
                                <div class="col s12">
                                  <label for="credit_card_name">Nome no Cartão</label>
                                  <input tabindex="7" type="text" id="credit_card_name" placeholder="Nome no Cartão" name="checkout[payment][credit_card_name]" required/>
                                  <small class="validation-message">Você precisa preencher esse campo</small>
                                </div>
                                <div class="col s8">
                                  <label for="expire_date">Data de Validade</label>
                                  <input  tabindex="8" type="tel" id="expire_date" placeholder="Mês/Ano" name="checkout[payment][expire_date]" required/>
                                  <small class="validation-message">Você precisa preencher uma data válida</small>
                                </div>
                                <div class="col s4">
                                  <label for="cvv">CVV</label>
                                  <input  tabindex="9" type="tel" id="cvv" placeholder="CVV" name="checkout[payment][cvv]" required/>
                                  <small class="validation-message">Você precisa preencher esse campo</small>
                                </div>
                                <div class="col s12">
                                    <label for="installments">Opções de pagamento</label>
                                    <select name="checkout[payment][installments]" id="installments">
                                        <option value="1">1x</option>
                                    </select>
                                </div>
                                    <input type="hidden" id="credit_card_label" name="checkout[payment][credit_card_label]" />
                          </div> <!-- linha -->
                        </div>
                      </div>
										</div>
										<div class="row">
												<div class="col s12 m8">
														<div class="continue-action">
																<a href="#" class="back-step">Voltar</a>
																<button class="btn btn-primary continue-step submit-step" data-step="3">Assinar agora!</button>
														</div>
												</div>
										</div>
								</div>
								<div class="col s12 checkout-step step3" data-step="3">
										<div class="row">
												<div class="col s12">
														<h3 class="step-title">Assinatura</h3>
												</div>
										</div>

										<div class="row">
												<div class="col s12">
														<h5 id="planName" class="plan-name">
																
														</h5>
														<div id="planDescription" class="plan-description">

														</div>
														<div id="planValue" class="plan-value">

														</div>
												</div>
										</div>
		<div class="row">
		<div class="col s12"><img class="security-badge" src="<?php echo esc_url( plugins_url( 'assets/img/site-seguro-google.png', __FILE__ ) ); ?>" width="350" alt="compre com segurança" /></div>
		</div>
		<div class="row">
		<div class="col s12">
		<small>Ao efetuar a compra de sua assinatura, você concorda com nossos <a href="/politica-de-privacidade/">Termos de uso e privacidade</a></small>
		</div>
		</div>


										<div class="row">
												<div class="col s12">
														<div class="continue-action">
																<a href="#" class="back-step">Voltar</a>
																<button class="btn btn-primary continue-step" data-step="3"></button>
														</div>
												</div>
										</div>
								</div>
						</div>
            <input type="hidden" id="recaptcha-token" name="token" />
				</form>
				<div class="loading-component">
						<div class="loader">Carregando...</div>
				</div>
				<div class="success-order">
						<H2 class="message-title">Seu pedido foi confirmado com sucesso!</H2>
						<p>Enviamos um e-mail para você confirmando seu pedido.</p>
				</div>
		</div>
<script src="https://www.google.com/recaptcha/api.js?render=<?php echo $recaptcha_site_key ?>">
  window.checkout_recaptcha = "<?php echo $recaptcha_site_key ?>"
</script>
<script>
  window.checkout_recaptcha = "<?php echo $recaptcha_site_key ?>"
</script>