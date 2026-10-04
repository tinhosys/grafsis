$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

$oldSave = '(?s)forma_pagamento:\s*form.forma_pagamento.value,\s*status_pagamento:\s*form.status_pagamento.value,'

$newSave = @'
        forma_pagamento: document.getElementById('order-metodo-pagto')?.value || 'Dinheiro',
        obs_pagto: document.getElementById('order-obs-pagto')?.value || '',
        valor_recebido: parseFloat(document.getElementById("order-valor-recebido")?.value) || 0,
        status_pagamento: (parseFloat(document.getElementById("order-valor-recebido")?.value) || 0) > 0 ? 'parcial' : 'pendente',
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldSave, $newSave)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)
