<script lang="ts">
	import { language } from '$lib/language/util';

	let languageSelected: any;

	$: language.set(languageSelected);
</script>

<select bind:value={languageSelected} class="shadow-xl px-1 rounded-box">
	<option value="FR">FR</option>
	<option value="EN">EN</option>
</select>
