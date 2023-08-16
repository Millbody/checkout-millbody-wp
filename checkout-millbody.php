<?php 
/*
Plugin Name: Checkout Transparent Millbody
Plugin URI: https://www.millbody.com/personal/wordpress/
Description: A plugin to connect to your Millbody transparent checkout
Version: 1.3.15
Author: @jaimeflneto
Author URI: https://www.instagram.com/personal.millbody
License: GPL2
*/
$VERSION = '1.3.15';
function mbc_add_settings_page() {
  add_options_page( 'Millbody Settings', 'Millbody', 'manage_options', 'mbc-checkout-millbody-plugin', 'mbc_render_plugin_settings_page' );
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
	add_settings_field( 'mbc_plugin_setting_recaptcha_site_key', 'Recaptcha Chave de Site', 'mbc_plugin_setting_recaptcha_site_key', 'mbc_checkout_millbody_plugin', 'api_settings' );
}
add_action( 'admin_init', 'mbc_register_settings' );

function register_millbody_attr(){
  $js_url = plugins_url( 'assets/js/global-millbody.js', __FILE__ );
  wp_enqueue_script( 'global-millbody', $js_url, array(), $GLOBALS["VERSION"], true);
}

add_action('wp_enqueue_scripts', 'register_millbody_attr');

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
	$account_code = isset($options['account_code']) ? $options['account_code'] : '';
?>
  <input id='mbc_plugin_setting_account_code' name='mbc_checkout_millbody_plugin_options[account_code]' type='text' value="<?php echo esc_attr( $account_code ) ?>" />
<?php 
	}

	function mbc_plugin_setting_recaptcha_site_key() {
		$options = get_option( 'mbc_checkout_millbody_plugin_options' );
		$recaptcha_site_key = isset($options['recaptcha_site_key']) ? $options['recaptcha_site_key'] : '';
	?>
		<input id='mbc_plugin_setting_recaptcha_site_key' name='mbc_checkout_millbody_plugin_options[recaptcha_site_key]' type='text' value="<?php echo esc_attr( $recaptcha_site_key ) ?>" />
	<?php
	}
function mbc_checkout_millbody_form($atts, $content = null) {

    $default = array(
				'account' => isset(get_option( 'mbc_checkout_millbody_plugin_options' )['account_code']) ? get_option( 'mbc_checkout_millbody_plugin_options' )['account_code'] : '',
				'recaptcha_site_key' =>  isset(get_option( 'mbc_checkout_millbody_plugin_options' )['recaptcha_site_key']) ? get_option( 'mbc_checkout_millbody_plugin_options' )['recaptcha_site_key'] : '',
				'plan_code' => 'mensal'
    );
    $shortcode_values = shortcode_atts($default, $atts);
		$content = do_shortcode($content);
		$account = $shortcode_values['account'];
    $redirect = $atts['redirect'];
		$recaptcha_site_key = $default['recaptcha_site_key'];
    if(isset($atts['success_redirect'])) $redirect = $atts['success_redirect'];
    $plan_code = $shortcode_values['plan_code'];
    wp_enqueue_script('jquery-card', plugins_url( 'assets/js/jquery.card.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
    wp_enqueue_script('jquery-mask', plugins_url( 'assets/js/jquery.mask.min.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
		wp_enqueue_script('crypto-js', plugins_url( 'assets/js/crypto-js.min.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
		
    wp_enqueue_script('checkout-functions', plugins_url( 'assets/js/functions.js', __FILE__ ), array('jquery'), $GLOBALS["VERSION"], true);
    wp_enqueue_script('checkout', plugins_url( 'assets/js/checkout-millbody.js', __FILE__ ), array('checkout-functions'), $GLOBALS["VERSION"], true);
    wp_enqueue_style('checkout-style', plugins_url( 'assets/css/checkout-millbody.css', __FILE__ ), array(), $GLOBALS["VERSION"]);

  	include 'checkout-form.php';

}
add_shortcode('checkout_millbody', 'mbc_checkout_millbody_form'); 
