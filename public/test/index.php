<?php
$referer_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : false;
// $allow_origin = 'editor.sparebeat.bo-yakitarako.com';
$allow_origin = 'localhost';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $referer_url && parse_url($referer_url)['host'] === $allow_origin) {
	$music = str_replace(' ', '+', filter_input(INPUT_POST, 'music'));
	$map = 'data:application/json;base64,' . base64_encode(filter_input(INPUT_POST, 'map'));
} else {
	return;
}
?>
<!DOCTYPE html>
<html>

<head>
	<title>テストプレイ</title>
	<script>
		const musicSrc = '<?php echo $music ?>';
		let music = '';
		if (musicSrc) {
			try {
				localStorage.music = musicSrc;
				music = musicSrc;
			} catch {
				alert('音源ファイルのサイズが大きすぎます');
			}
		} else {
			music = localStorage.music;
		}
	</script>
</head>

<body style="text-align: center;">
	<h2>テストプレイ</h2>
	<iframe id="sparebeat" width="960" height="640" src="https://sparebeat.com/embed/" frameborder="0"></iframe>
	<script src="https://sparebeat.com/embed/client.js"></script>
	<script>
		Sparebeat.load('<?php echo $map ?>', music);
	</script>
</body>

</html>