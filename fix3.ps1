$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

$oldRecalc = '(?s)\},\s*recalcTotals\(\) \{.*?return \{ subtotal, discount, finalTotal \};\s*\}'
$newRecalc = @'
  },
  recalcTotals(source = 'val') {
    const subtotal = this.activeItems.reduce((acc, it) => acc + (parseFloat(it.valor_total) || 0), 0);
    let descVal = parseFloat(document.getElementById('order-discount')?.value) || 0;
    let descPerc = parseFloat(document.getElementById('order-discount-perc')?.value) || 0;
    
    if (source === 'perc') {
      descVal = subtotal * (descPerc / 100);
      const valEl = document.getElementById('order-discount');
      if (valEl) valEl.value = descVal.toFixed(2);
    } else if (source === 'val' && subtotal > 0) {
      descPerc = (descVal / subtotal) * 100;
      const percEl = document.getElementById('order-discount-perc');
      if (percEl) percEl.value = descPerc.toFixed(2);
    }

    const finalTotal = Math.max(0, subtotal - descVal);
    if (document.getElementById('order-subtotal')) {
      document.getElementById('order-subtotal').innerText = 'R$ ' + subtotal.toFixed(2);
      document.getElementById('order-total-final').innerText = 'R$ ' + finalTotal.toFixed(2);
    }
    
    const valorRecebido = parseFloat(document.getElementById('order-valor-recebido')?.value) || 0;
    if (valorRecebido > 0 || finalTotal > 0) {
      if (this.updateFinanceSummary) this.updateFinanceSummary(valorRecebido, finalTotal);
    }
    
    return { subtotal, discount: descVal, finalTotal };
  }
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldRecalc, $newRecalc)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)
