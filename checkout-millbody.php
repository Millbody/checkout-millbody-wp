<?php 
/*
Plugin Name: Checkout Transparent Millbody
Plugin URI: https://www.millbody.com/personal/wordpress/
Description: A plugin to connect to your Millbody transparent checkout
Version: 1.0.4
Author: jaimeflneto
Author URI: https://www.instagram.com/jaimeflneto
License: GPL2
*/
$VERSION = '1.0.4';
function mbc_add_settings_page() {
  add_options_page( 'Millbody Settings', 'Millbody', 'manage_options', ‘mbc-checkout-millbody-plugin’, 'mbc_render_plugin_settings_page' );
}
add_action( 'admin_menu', 'mbc_add_settings_page' );

function mbc_render_plugin_settings_page() {
?>
    <h2>Millbody Settings</h2>
    <form action="options.php" method="post">
        <?php 
        settings_fields( 'mbc_checkout_millbody_plugin_options' );
        do_settings_sections( 'mbc_checkout_millbody_plugin' ); ?>
        <input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e( 'Save' ); ?>" />
    </form>
<?php
}
function mbc_register_settings() {
  register_setting( 'mbc_checkout_millbody_plugin_options', 'mbc_checkout_millbody_plugin_options' );
  add_settings_section( 'api_settings', 'Account Settings', 'mbc_plugin_section_text', 'mbc_checkout_millbody_plugin' );

  add_settings_field( 'mbc_plugin_setting_account_code', 'Account Code', 'mbc_plugin_setting_account_code', 'mbc_checkout_millbody_plugin', 'api_settings' );
}
add_action( 'admin_init', 'mbc_register_settings' );

function mbc_checkout_millbody_plugin_options_validate( $input ) {
  $newinput['account_code'] = trim( $input['account_code'] );
  if ( ! preg_match( '/^[a-z0-9]{32}$/i', $newinput['account_code'] ) ) {
      $newinput['account_code'] = '';
  }

  return $newinput;
}

function mbc_plugin_section_text() {
  echo '<p>Here you can set all the options for using the Checkout Millbody</p>';
}

function mbc_plugin_setting_account_code() {
  $options = get_option( 'mbc_checkout_millbody_plugin_options' );
?>
  <input id='mbc_plugin_setting_account_code' name='mbc_checkout_millbody_plugin_options[account_code]' type='text' value="<?php echo esc_attr( $options['account_code'] ) ?>" />
<?php 
}
function mbc_checkout_millbody_form($atts, $content = null) {

    $default = array(
				'account' => get_option( 'mbc_checkout_millbody_plugin_options' )['account_code'],
				'plan_code' => 'mensal'
    );
    $shortcode_values = shortcode_atts($default, $atts);
		$content = do_shortcode($content);
		$account = $shortcode_values['account'];
    $redirect = $atts['redirect'];
    if($atts['success_redirect']) $redirect = $atts['success_redirect'];
    $plan_code = $shortcode_values['plan_code'];
    wp_enqueue_script('jquery-card', plugins_url( 'assets/js/jquery.card.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
    wp_enqueue_script('jquery-mask', plugins_url( 'assets/js/jquery.mask.min.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
    wp_enqueue_script('checkout-functions', plugins_url( 'assets/js/functions.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
    wp_enqueue_script('checkout', plugins_url( 'assets/js/checkout-millbody.js', __FILE__ ), array('checkout-functions'), $GLOBALS["VERSION"], true);
    wp_enqueue_style('checkout-style', plugins_url( 'assets/css/checkout-millbody.css', __FILE__ ), array(), $GLOBALS["VERSION"])
?>
<div id="assinar" class="checkout template-onestepcheckout">
				<form method="POST" action="https://gym.millbody.com/<?php echo $account ?>/checkout/" data-account="<?php echo $account ?>" id="millbody-checkout" class="millbody-checkout" <?php if ($redirect) echo "data-redirect='$redirect'" ?>>
						<div class="row">
								<div class="col s12 m6 checkout-step step1 enabled" data-step="1">
										<div class="row">
												<div class="col s12">
														<h3 class="step-title">Você</h3>
														<input type="hidden" id="plan_code" name="checkout[plan_code]" value="<?php echo $plan_code ?>">
												</div>
										</div>
										<div class="row">
												<div class="col s12">
														<label for="email">E-mail*</label>
														<input type="email" id="email" name="checkout[customer][email]" placeholder="Digite seu e-mail" required/>
														<small class="validation-message">Digite um email válido</small>
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
														<input type="text" id="name" name="checkout[customer][name]" placeholder="Digite seu nome" required/>
														<small class="validation-message">Você precisa preencher esse campo</small>
												</div>
												<div class="col s6">
														<label for="last_name">Sobrenome*</label>
														<input type="text" id="last_name" name="checkout[customer][last_name]" placeholder="Digite seu sobrenome" required/>
														<small class="validation-message">Você precisa preencher esse campo</small>
												</div>
										</div>
										<div class="row">
												<div class="col s6">
														<label for="cpf">CPF*</label>
														<input type="tel" id="cpf" name="checkout[customer][cpf]" placeholder="Digite seu CPF" required/>
														<small class="validation-message">Digite um CPF válido</small>
												</div>
												<div class="col s6">
														<label for="phone">Telefone*</label>
														<input type="tel" id="phone" name="checkout[customer][phone]" placeholder="Digite seu telefone" required/>
														<small class="validation-message">Digite um telefone válido</small>
												</div>
										</div>
										<div class="row">
											<div class="col s12">
													<button class="btn btn-primary continue-step" data-step="2">Continuar</button>
											</div>
										</div>
								</div>
								<div class="col s12 m6 checkout-step submit-step step2 disabled checkout-payment" data-step="2">
										<div class="row">
												<div class="col s12">
														<h3 class="step-title">Pagamento</h3>
												</div>
										</div>
										<div class="row">
												<div class="row">
														<div class="col s12">
																<div class="card-wrapper"></div>
														</div>
												</div>
											<div class="row">
												<div class="col s12">
														<div class="col s12">
																<input type="tel" id="credit_card_number" placeholder="Número do cartão" name="checkout[payment][credit_card_number]" required/>
																<small class="validation-message">Digite um número de cartão válido</small>
														</div>
														<div class="col s12">
																<input type="text" id="credit_card_name" placeholder="Nome no Cartão" name="checkout[payment][credit_card_name]" required/>
																<small class="validation-message">Você precisa preencher esse campo</small>
														</div>
														<div class="col s4">
																<input type="tel" id="expire_date" placeholder="Validade" name="checkout[payment][expire_date]" required/>
																<small class="validation-message">Você precisa preencher uma data válida</small>
														</div>
														<div class="col s8">
																<input type="tel" id="cvv" placeholder="CVV" name="checkout[payment][cvv]" required/>
																<small class="validation-message">Você precisa preencher esse campo</small>
														</div>
														<div class="col s12">
																<label for="installments">Parcelas</label>
																<select name="checkout[payment][installments]" id="installments">
																		<option value="1">1x</option>
																</select>
														</div>
																<input type="hidden" id="credit_card_label" name="checkout[payment][credit_card_label]" />
											</div>
												</div>
										</div>
										<div class="row">
												<div class="col s12">
														<div class="continue-action">
																<a href="#" class="back-step">Voltar</a>
																<button class="btn btn-primary continue-step submit-step" data-step="3">Assinar agora!</button>
														</div>
												</div>
										</div>
								</div>
								<div class="col s12 m6 checkout-step step3" data-step="3">
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
				</form>
				<div class="loading-component">
						<div class="loader">Carregando...</div>
				</div>
				<div class="success-order">
						<H2 class="message-title">Seu pedido foi confirmado com sucesso!</H2>
						<p>Enviamos um e-mail para você confirmando seu pedido.</p>
				</div>
		</div>
    
    <style>
</style>
<?php
}
add_shortcode('checkout_millbody', 'mbc_checkout_millbody_form'); 
